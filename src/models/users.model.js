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

schema.statics.setAccessToken = function setAccessToken(user, app, shared, ip, type) {
  const { token_state: tokenState } = enums;
  const [active, pending] = tokenState;
  const hasIp = this.hasIp(user, ip);
  const { email, tenant } = user;
  // const state = hasIp ? active : pending;
  const state = active;
  const info = { email, type, tenant, app, shared };
  return this.model('Tokens').generate(state, ip, info)
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
    'login.type': Login.statics.typeFormat(email, type, hash, type !== password || true),
  };
  if (!hasApp) {
    data['login.app'] = Login.statics.appFormat(app);
  }
  if (!hasIP) {
    data.ip_registered = IP.statics.ipFormat(ip, type !== password || true);
  }
  return this.updateOne({ email, tenant, shared }, { $push: data }, { runValidators: true })
    .then(() => this.setVal(user, 'addType'))
};

schema.statics.validatePassword = function validatePassword(user, app, type, hash, ip, shared) {
  const { email } = user;
  const currentType = this.getType(user, type);
  return Login.statics.validatePassword(email, currentType, hash)
    .then(({ access }) => {
      if (!access) {
        return user;
      }
      return this.setAccessToken(user, app, shared, ip, type);
    });
};

schema.statics.createUserOnApp = function createUserOnApp(email, type, ip, hash, tenant, app) {
  const login =  Login.statics.loginFormat(email, type, hash, app, type !== password);
  const ipRegistered = [IP.statics.ipFormat(ip)];
  const body = { email, tenant, login, ip_registered: ipRegistered };
  return this.model('Apps').isShared(app)
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
      .then((user) => this.validatePassword(user, app, type, hash, ip, shared))
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
    .then(() => this.getEmailByApp(email, tenant, app));
};

schema.statics.signin = function signin(email, type, hash, ip, tenant, app) {
  return this.model('Apps').isShared(app)
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
    
    .then((user) => {
      if(user)
        return user
        throw new Error(this.Unauthorized);
    })
    .then((user) => this.validatePassword(user, app, type, hash, ip, shared))))
    .then(this.userObject.bind(this))
    .catch((err) => this.setMessage({}, err));
};

schema.statics.userSession = function userSession(user, created, expiration, state = userState[0]) {
  const { email = 'nomail', tenant = 'default', login } = user;
  const { type = [] } = login;
  if (state !== userState[0]) {
    return { email, state };
  }
  return {
    email,
    tenant,
    state,
    logins: type.filter(({ status }) => !!status).map(({ code }) => code),
    created,
    expiration,
  };
};

schema.statics.getDataToken = function getDataToken(token, tenantName, appCode, ip) {
  return this.model('Tokens').check(token, ip)
    .then(({
      email, type, app, tenant, shared, code, createdAt, expiredAt
    }) => {
      if(tenant !== tenantName || (app !== appCode && !shared)) {
        return this.model('Tokens').invalidate(code)
          .then(() => {
            throw new Error('Token data invalid') 
          });
      }
      return this.getEmailByApp(email, tenant, app)
        .then((user) => ({
          user, createdAt, expiredAt, type,
        }))
    })
    .then(({
      user, createdAt, expiredAt, type,
    }) => {
      if (
        !!user
        && user.state === enums.user_state_default
        && Login.statics.isPasswordActive(this.getType(user, type))
        && this.hasIp(user, ip)
      ) {
        return this.userSession(user, createdAt, expiredAt);
      } if (
        !!user
        && this.hasIp(user, ip)
        && !Login.statics.isPasswordActive(this.getType(user, type))
      ) {
        // return this.userSession(user, createdAt, expiredAt, userState[3]);
        return this.userSession(user, createdAt, expiredAt, user.state);
      } if (!!user && !this.hasIp(user, ip)) {
        // return this.userSession(user, createdAt, expiredAt, userState[4]);
        return this.userSession(user, createdAt, expiredAt, user.state);
      } if (user) {
        return this.userSession(user, createdAt, expiredAt, user.state);
      }
      throw new Error('User does not exist');
    })
    .then((data) => ({ data }))
    .catch((err) => ({ err }));
};

schema.statics.changePassword = function changePassword(email, tenant, login, hash) {
  const newPass =  Login.statics.passwordFormat(email, login, hash, true, enums.user_change_password);
  const query = { email, tenant };
  //https://www.mongodb.com/community/forums/t/push-into-array-while-seting-fields-of-existing-elements/16527/4
  const push = {
    $push: { "login.type.$[t].password": newPass },
  }
  const filtersPush = {
    arrayFilters: [ { "t.code": login } ]
  }
  return this.updateOne(query, push, filtersPush)
    .then(({ nModified }) => {
      if (nModified === 1) {
        return true
      }
      throw new Error('Password not added')
    })
    .then(() => {
      const set = {
        $set: { "login.type.$[t].password.$[p].status": false },
      }
      const filtersSet = {
        arrayFilters: [ { "t.code": login }, { "p.code": { $ne: newPass.code } } ]
      }
      return this.updateOne(query, set, filtersSet)
    })
    .then(({ nModified }) => {
      if (nModified === 1) {
        return true
      }
      throw new Error('Passwords not updated')
    });
  
}

module.exports = schema;
