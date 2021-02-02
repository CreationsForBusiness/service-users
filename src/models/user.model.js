const mongoose = require('mongoose');

const { Schema } = mongoose;

const { getRandomNumber } = require('../libs/commons.lib');
const {
  database_fixed_values: enums,
  max_username: longUsername,
} = require('../constants');

const { login_types: loginTypes } = enums;
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

schema.statics.nextUsername = (username) => `${username}${getRandomNumber(0, 99, 2)}`;

schema.statics.getEmail = function getEmail(email) {
  return this.findOne({ 'info.mail': email });
};

schema.statics.getUsername = function getUsername(username, original, attempt = 0) {
  const first = original ? username : original;
  if (username.length > longUsername) {
    return attempt > 10
      ? Promise.reject(new Error('Username cant be generated'))
      : this.getUsername(this.nextUsername(username), first, attempt + 1);
  }
  return this.exists({ username })
    .then((exist) => (!exist
      ? username
      : this.getUsername(this.nextUsername(username), first, attempt + 1)));
};

schema.statics.hasApp = ({ info = [] }, app) => !!info.app.find(({ code }) => code === app);

schema.statics.getType = ({ info }, type) => info.type.find(({ code }) => code === type);

schema.statics.hasType = function hasType({ info }, type) {
  return !!this.getType({ info }, type);
};

schema.statics.hasIp = ({ ip_registered: ips }, newIp) => !!ips.find(({ ip }) => ip === newIp);

schema.statics.setVal = (user, field, value = true) => {
  const data = user;
  data[field] = value;
  return data;
};

schema.statics.setHasType = function setHasType(user, value = true) {
  return this.setVal(user, 'hasType', value);
};

schema.statics.setAddType = function setAddType(user, value = true) {
  return this.setVal(user, 'addType', value);
};

schema.statics.setAccessToken = function setAccessToken(user, generate = true) {
  const token = generate ? 'abc' : null;
  return this.setVal(user, 'accessToken', token);
};

schema.statics.setMessage = function setMessage(user, message) {
  return this.setVal(user, 'message', message);
};

schema.statics.addType = function addPasswordType(user, hash, app, type, ip) {
  const { username } = user;
  const hasApp = this.hasApp(user, app);
  const hasIP = this.hasIp(user, ip);
  const data = {
    'info.type': Info.statics.typeFormat(type, hash, username),
  };
  if (!hasApp) {
    data['info.app'] = Info.statics.appFormat(app);
  }
  if (!hasIP) {
    data.ip_registered = IP.statics.ipFormat(ip);
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

schema.statics.validatePassword = function validatePassword(user, type, hash) {
  const { username } = user;
  const currentType = this.getType(user, type);
  return Info.statics.validatePassword(username, currentType, hash)
    .then(({ access }) => {
      if (!access) {
        return user;
      }
      return this.setAccessToken(user);
    });
};

schema.statics.createUserOnApp = function createUserOnApp(email, username, type, ip, hash, app) {
  return this.findOne({ 'info.mail': email })
    .then((user) => (user
      ? this.addAppToUser(user, app, ip, type, hash)
      : this.create({
        username,
        info: Info.statics.infoFormat(email, type, hash, app, username),
        ip_registered: [IP.statics.ipFormat(ip)],
      })
    ))
    .then(({ username: un, hasType, addType }) => this.getUser(un, hasType, addType))
    .then((user) => this.validatePassword(user, type, hash))
    .then((user) => {
      if (!user.AddType && user.hasType && !user.accessToken && type === password) {
        return this.setMessage(user, 'User already exist');
      } if (user.addType && type === password) {
        return this.setAccessToken(user, false);
      }
      return user;
    })
    .then((user) => this.userObject(user, type));
};

schema.statics.signup = function signup(email, username, type, ip, hash, app) {
  return this.getEmail(email)
    .then((user) => (user ? user.username : this.getUsername(username)))
    .then((user) => this.createUserOnApp(email, user, type, ip, hash, app));
};

schema.statics.getUser = function getUser(username, hasType = false, addType = false) {
  return this.findOne({ username })
    .then((user) => this.setHasType(user, hasType))
    .then((user) => this.setAddType(user, addType));
};

schema.statics.userObject = function userObject(user, type) {
  const {
    username, accessToken = null, message = null, addType, hasType
  } = user;
  const currentType = this.getType(user, type);
  const isActive = Info.statics.isPasswordActive(currentType, type);
  const data = { username };
  let state = 201;

  if (isActive && !!accessToken) {
    data.token = accessToken;
  }
  if (message) {
    data.message = message;
  }
  if(!!hasType && !!!addType) {
    state = 200;
  } else if(!!!hasType && !!addType) {
    state = 202
  }
  data.state = state;
  return data;
};

module.exports = mongoose.model('users', schema);
