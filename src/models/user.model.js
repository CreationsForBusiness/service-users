const mongoose = require('mongoose');

const { Schema } = mongoose;

const {
  database_fixed_values: enums,
} = require('../constants');

const { login_types: loginTypes, user_state: userState } = enums;
const { password, google, facebook } = loginTypes;

const Login = require('./schemas/login.schema');
const IP = require('./schemas/ip.schema');

const tenantDefault = "default"

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
  shared: {
    type: Boolean,
    required: true,
    default: true,
  },
  tenant: {
    type: String,
    required: true,
    default: 'default'
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

// to review
schema.statics.getEmail = function getEmail(email, tenant, shared = true) {
  return this.findOne({ email, tenant, shared });
};

schema.statics.getEmailByApp = function getEmailByApp(email, tenant, app, status = null) {
  const query = { email, tenant: tenant || tenantDefault, "login.app.code": app }
  if(status !== null) {
    query.status = status
  }
  return this.findOne(query);
};

schema.statics.hasApp = ({ login = {} }, app) => !!login?.app?.find(({ code }) => code === app);

schema.statics.getType = ({ login = {} }, type) => login.type.find(({ code }) => code === type);

// to review
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

schema.statics.addType = function addPasswordType(user, hash, tenant, app, type, ip) {
  const { email, shared } = user;
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
  return this.updateOne({ email, tenant, shared }, { $push: data }, { runValidators: true })
    .then(() => this.setVal(user, 'addType'))
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

schema.statics.createUserOnApp = function createUserOnApp(email, type, ip, hash, tenant, app) {
  const login =  Login.statics.loginFormat(email, type, hash, app, type !== password);
  const ipRegistered = [IP.statics.ipFormat(ip)];
  const body = { email, tenant, login, ip_registered: ipRegistered };
  return this.model('apps').isShared(app)
    .then(shared => (this.getEmailByApp(email, tenant, app)
      .then(user => {
        if(!user && shared) {
          return this.getEmail(email, tenant)
            .then(user => (
              user
                ? this.addType(user, hash, tenant, app, type, ip)
                : this.create(body)
            ));
        } else if (!user && !shared) {
          return this.create({ ...body, shared: false });
        } 
        return user;
      })
      .then((user) => this.validatePassword(user, type, hash, ip))
      .then((user) => {
        if(!user.accessToken) {
          return this.setMessage(user, this.Unauthorized);
        }
        return user
      })
      .then(this.userObject.bind(this))));

};

schema.statics.signup = function signup(email, type, ip, hash, tenant, app) {
  return this.createUserOnApp(email, type, ip, hash, tenant, app);
};

schema.statics.getUser = function getUser(email, app) {
  return this.getEmail(email)
};

schema.statics.userObject = function userObject(user) {
  const {
    email, accessToken = null, message = null, addType = false,
  } = user;

  const hasToken = !!accessToken;

  const data = {
    email,
    is_new: !addType,
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

schema.statics.addTypeOnSignIn = function addTypeOnSignIn(user, hash, tenant, app, type, ip) {
  const { email } = user;
  return this.addType(user, hash, tenant, app, type, ip)
    .then(() => this.getEmailByApp(email, app));
};

schema.statics.signin = function signin(email, type, hash, ip, tenant, app) {
  return this.model('apps').isShared(app)
    .then(shared => (
      this.getEmailByApp(email, tenant, app, true)
        .then(user => {
          if(!user && shared) {
            return this.getEmail(email, tenant)
              .then(user => (
                user
                  ? this.addTypeOnSignIn(user, hash, tenant, app, type, ip)
                  : user
              ))
          } 
          return user;
        })
    ))
    .then((user) => {
      if(user)
        return user
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
