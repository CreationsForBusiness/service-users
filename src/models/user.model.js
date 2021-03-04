const mongoose = require('mongoose');

const { Schema } = mongoose;

const { getRandomNumber, getRandomString } = require('../libs/commons.lib');

const {
  database_fixed_values: enums,
  max_username: longUsername,
} = require('../constants');

const { login_types: loginTypes, user_state: userState } = enums;
const { password, google, facebook } = loginTypes;

const Info = require('./schemas/info.schema');
const IP = require('./schemas/ip.schema');

const schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  info: {
    type: Info,
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

schema.statics.nextUsername = (username) => `${username}${getRandomNumber(0, 99, 2)}`;

schema.statics.getEmail = function getEmail(email) {
  return this.findOne({ 'info.mail': email });
};

schema.statics.getUsername = function getUsername(usernameSuggested, type, original, attempt = 0) {
  const username = type === password ? usernameSuggested : getRandomString().replace(/[-+()\s1-9]/g, '');
  const first = original ? username : original;
  if (username.length > longUsername && attempt >= 10) {
    return Promise.reject(new Error('Username cant be generated'));
  }
  return this.exists({ username })
    .then((exist) => (!exist
      ? username
      : this.getUsername(this.nextUsername(username), type, first, attempt + 1)));
};

schema.statics.hasApp = ({ info = {} }, app) => !!info.app.find(({ code }) => code === app);

schema.statics.getType = ({ info = {} }, type) => info.type.find(({ code }) => code === type);

schema.statics.hasType = function hasType({ info }, type) {
  return !!this.getType({ info }, type);
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
  const { username } = user;
  const state = hasIp ? active : pending;
  const info = { username, type };
  return this.model('tokens').generate(state, ip, info)
    .then((token) => this.setVal(user, 'accessToken', token));
};

schema.statics.setMessage = function setMessage(user, message) {
  return this.setVal(user, 'message', message);
};

schema.statics.addType = function addPasswordType(user, hash, app, type, ip) {
  const { username } = user;
  const hasApp = this.hasApp(user, app);
  const hasIP = this.hasIp(user, ip);
  const data = {
    'info.type': Info.statics.typeFormat(type, hash, username, type !== password),
  };
  if (!hasApp) {
    data['info.app'] = Info.statics.appFormat(app);
  }
  if (!hasIP) {
    data.ip_registered = IP.statics.ipFormat(ip, type !== password);
  }
  return this.updateOne({ username }, { $push: data }, { runValidators: true })
    .then(({ n }) => ((n === 0) ? this.setHasType(user) : user));
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
  const { username } = user;
  const currentType = this.getType(user, type);
  return Info.statics.validatePassword(username, currentType, hash)
    .then(({ access }) => {
      if (!access) {
        return user;
      }
      return this.setAccessToken(user, ip, type);
    });
};

schema.statics.createUserOnApp = function createUserOnApp(email, username, type, ip, hash, app) {
  return this.findOne({ 'info.mail': email })
    .then((user) => (user
      ? this.addAppToUser(user, app, ip, type, hash)
      : this.create({
        username,
        info: Info.statics.infoFormat(email, type, hash, app, username, type !== password),
        ip_registered: [IP.statics.ipFormat(ip)],
      })
    ))
    .then(({ username: un, hasType, addType }) => this.getUser(un, hasType, addType))
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

schema.statics.signup = function signup(email, username, type, ip, hash, app) {
  return this.getEmail(email)
    .then((user) => (user ? user.username : this.getUsername(username, type)))
    .then((user) => this.createUserOnApp(email, user, type, ip, hash, app));
};

schema.statics.getUser = function getUser(username, hasType = false, addType = false) {
  return this.findOne({ username })
    .then((user) => this.setHasType(user, hasType))
    .then((user) => this.setAddType(user, addType));
};

schema.statics.userObject = function userObject(user) {
  const {
    username, accessToken = null, message = null, addType, hasType,
  } = user;

  const hasToken = !!accessToken;

  const data = {
    username,
    is_new: !hasType && !addType,
    is_modify: addType,
    token: accessToken,
  };

  if (!hasToken) {
    delete data.username;
    data.message = this.Unauthorized;
  } else if (message) {
    data.message = message;
  }

  return data;
};

schema.statics.addTypeOnSignIn = function addTypeOnSignIn(user, hash, app, type, ip) {
  const { username } = user;
  return this.addType(user, hash, app, type, ip)
    .then(() => this.getUser(username));
};

schema.statics.signin = function signin(identifier, type, hash, ip, app) {
  return this.findOne({ status: true, $or: [{ username: identifier }, { 'info.mail': identifier }] })
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
  const { username, info } = user;
  const { mail: email = 'nomail', type = [] } = info;
  if (state !== userState[0]) {
    return { username, state };
  }
  return {
    username,
    state,
    email,
    logins: type.filter(({ status }) => !!status).map(({ code }) => code),
    created,
    expiration,
  };
};

schema.statics.getDataToken = function getDataToken(token, ip) {
  return this.model('tokens').check(token, ip)
    .then(({
      username, createdAt, expiredAt, type,
    }) => (
      this.getUser(username).then(((user) => ({
        user, createdAt, expiredAt, type,
      })))))
    .then(({
      user, createdAt, expiredAt, type,
    }) => {
      if (
        !!user
        && user.state === enums.user_state_default
        && Info.statics.isPasswordActive(this.getType(user, type), type)
        && this.hasIp(user, ip)
      ) {
        return this.userSession(user, createdAt, expiredAt);
      } if (
        !!user
        && this.hasIp(user, ip)
        && !Info.statics.isPasswordActive(this.getType(user, type), type)
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
