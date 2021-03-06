const mongoose = require('mongoose');

const { Schema } = mongoose;

const {
  database_fixed_values: enums,
} = require('../constants');

const { login_types: loginTypes, user_state: userState } = enums;
const { password, google, facebook } = loginTypes;

const Login = require('./schemas/login.schema');
const IP = require('./schemas/ip.schema');

const schema = new Schema({
  email: {
    type: String,
    required: true,
  },
  login: {
    type: Login,
    required: true,
    default: [],
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
  state: {
    type: String,
    required: true,
    enum: enums.user_state,
    default: enums.user_state_default,
  },
  ip_registered: {
    type: [IP],
    required: true,
  },
});

schema.statics.Unauthorized = 'Invalid Credential';

schema.statics.getEmail = function getEmail(email) {
  return this.findOne({ email });
};

schema.statics.hasApp = ({ login = {} }, app) => !!login.app.find(({ code }) => code === app);

schema.statics.getType = ({ login = {} }, type) => login.type.find(({ code }) => code === type);

schema.statics.hasType = function hasType({ login }, type) {
  return !!this.getType({ login }, type);
};

schema.statics.hasIp = ({ ip_registered: ips }, newIp) => !!ips
  .find(({ ip, status }) => ip === newIp && !!status);

schema.statics.setVal = (user, field, value = true) => {
  const data = user;
  data[field] = value;
  return data;
};

schema.statics.setHasType = function setHasType(user, value = true) {
  return this.setVal(user, 'hasType', !!value);
};

schema.statics.setAddType = function setAddType(user, value = true) {
  return this.setVal(user, 'addType', !!value);
};

schema.statics.setAccessToken = function setAccessToken(user, ip, type) {
  const { token_state: tokenState } = enums;
  const [active, pending] = tokenState;
  const hasIp = this.hasIp(user, ip);
  const { email } = user;
  const state = hasIp ? active : pending;
  const info = { email, type };
  return this.model('tokens').generate(state, ip, info)
    .then((token) => this.setVal(user, 'accessToken', token));
};

schema.statics.setMessage = function setMessage(user, message) {
  return this.setVal(user, 'message', message);
};

schema.statics.addType = function addPasswordType(user, hash, app, type, ip) {
  const { email } = user;
  const hasApp = this.hasApp(user, app);
  const hasIP = this.hasIp(user, ip);
  const data = {
    'login.type': Login.statics.typeFormat(type, hash, email, type !== password),
  };
  if (!hasApp) {
    data['login.app'] = Login.statics.appFormat(app);
  }
  if (!hasIP) {
    data.ip_registered = IP.statics.ipFormat(ip, type !== password);
  }
  return this.updateOne({ email }, { $push: data }, { runValidators: true })
    .then(({ n: modified }) => (modified === 0 ? this.setHasType(user) : user));
};

schema.statics.addAppToUser = function addAppToUser(user, app, ip, type, hash) {
  const {
    state, status,
  } = user;

  const hasType = this.hasType(user, type);

  if (state !== enums.user_state_default) {
    return Promise.reject(new Error(`The user is ${state}`));
  } if (!status) {
    return Promise.reject(new Error('The user was banned'));
  } if ([google, facebook, password].includes(type) && hasType) {
    return this.setHasType(user);
  } if ([google, facebook, password].includes(type)) {
    return this.addType(user, hash, app, type, ip)
      .then((u) => this.setHasType(u, hasType))
      .then((u) => this.setAddType(u));
  }
  return Promise.reject(new Error('Unknown login type'));
};

schema.statics.validatePassword = function validatePassword(user, type, hash, ip) {
  const { email } = user;
  const currentType = this.getType(user, type);
  return Login.statics.validatePassword(email, currentType, hash)
    .then(({ access }) => {
      if (!access) {
        return user;
      }
      return this.setAccessToken(user, ip, type);
    });
};

schema.statics.createUserOnApp = function createUserOnApp(email, type, ip, hash, app) {
  return this.findOne({ email })
    .then((user) => (user
      ? this.addAppToUser(user, app, ip, type, hash)
      : this.create({
        email,
        login: Login.statics.loginFormat(email, type, hash, app, type !== password),
        ip_registered: [IP.statics.ipFormat(ip)],
      })
    ))
    .then(({ email: mail, hasType, addType }) => this.getUser(mail, hasType, addType))
    .then((user) => this.validatePassword(user, type, hash, ip))
    .then((user) => {
      if (!user.AddType && user.hasType && !user.accessToken) {
        return this.setMessage(user, this.Unauthorized);
      } if (user.addType && type === password) {
        return this.setAccessToken(user, ip, type);
      }
      return user;
    })
    .then(this.userObject.bind(this));
};

schema.statics.signup = function signup(email, type, ip, hash, app) {
  return this.getEmail(email)
    .then((user) => (user ? user.email : email))
    .then((user) => this.createUserOnApp(user, type, ip, hash, app));
};

schema.statics.getUser = function getUser(email, hasType = false, addType = false) {
  return this.getEmail(email)
    .then((user) => this.setHasType(user, hasType))
    .then((user) => this.setAddType(user, addType));
};

schema.statics.userObject = function userObject(user) {
  const {
    email, accessToken = null, message = null, addType, hasType,
  } = user;

  const hasToken = !!accessToken;

  const data = {
    email,
    is_new: !hasType && !addType,
    is_modify: addType,
    token: accessToken,
  };

  if (!hasToken) {
    delete data.email;
    data.message = this.Unauthorized;
  } else if (message) {
    data.message = message;
  }

  return data;
};

schema.statics.addTypeOnSignIn = function addTypeOnSignIn(user, hash, app, type, ip) {
  const { email } = user;
  return this.addType(user, hash, app, type, ip)
    .then(() => this.getUser(email));
};

schema.statics.signin = function signin(email, type, hash, ip, app) {
  return this.findOne({ status: true, email })
    .then((user) => {
      if (
        !!user
        && this.hasApp(user, app)
        && this.hasType(user, type)
      ) {
        return user;
      } if (!!user && !this.hasType(user, type)) {
        return this.addTypeOnSignIn(user, hash, app, type, ip);
      }
      throw new Error(this.Unauthorized);
    })
    .then((user) => this.validatePassword(user, type, hash, ip))
    .then(this.userObject.bind(this))
    .catch((err) => this.setMessage({}, err));
};

schema.statics.userSession = function userSession(user, created, expiration, state = userState[0]) {
  const { email = 'nomail', login } = user;
  const { type = [] } = login;
  if (state !== userState[0]) {
    return { email, state };
  }
  return {
    email,
    state,
    logins: type.filter(({ status }) => !!status).map(({ code }) => code),
    created,
    expiration,
  };
};

schema.statics.getDataToken = function getDataToken(token, ip) {
  return this.model('tokens').check(token, ip)
    .then(({
      email, createdAt, expiredAt, type,
    }) => (
      this.getUser(email).then(((user) => ({
        user, createdAt, expiredAt, type,
      })))))
    .then(({
      user, createdAt, expiredAt, type,
    }) => {
      if (
        !!user
        && user.state === enums.user_state_default
        && Login.statics.isPasswordActive(this.getType(user, type), type)
        && this.hasIp(user, ip)
      ) {
        return this.userSession(user, createdAt, expiredAt);
      } if (
        !!user
        && this.hasIp(user, ip)
        && !Login.statics.isPasswordActive(this.getType(user, type), type)
      ) {
        return this.userSession(user, createdAt, expiredAt, userState[3]);
      } if (!!user && !this.hasIp(user, ip)) {
        return this.userSession(user, createdAt, expiredAt, userState[4]);
      } if (user) {
        return this.userSession(user, createdAt, expiredAt, user.state);
      }
      throw new Error('User does not exist');
    })
    .then((data) => ({ data }))
    .catch((err) => ({ err }));
};

module.exports = mongoose.model('users', schema);
