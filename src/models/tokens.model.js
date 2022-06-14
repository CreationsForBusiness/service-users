const mongoose = require('mongoose');

const { Schema } = mongoose;

const { database_fixed_values: enums } = require('../constants');
const { getRandomString } = require('../libs/commons.lib');
const jwt = require('../libs/token.lib');

const schema = new Schema({
  code: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    enum: enums.token_state,
    default: enums.token_state_default,
  },
  ip: {
    type: Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
  date: {
    type: Date,
    require: true,
    default: Date.now,
  },
});

schema.statics.generate = function generate(state, ip, info) {
  const code = getRandomString();
  return this.create({ state, ip, code })
    .then(() => jwt.generate({ ...info, code }));
};

schema.statics.getToken = function getToken(code) {
  return this.findOne({ code, status: true });
};

schema.statics.validateToken = function validateToken({
  email, code, app, tenant, shared, exp, iat, type,
}, ip) {
  const now = parseInt(new Date().getTime() / 1000, 10);
  const expiredAt = parseInt(exp, 10);
  const createdAt = parseInt(iat, 10);
  if (now > expiredAt) {
    return Promise.reject(new Error('Token expired'));
  }
  return this.getToken(code)
    .then((token) => {
      console.log("=>==>", token, ip)
      if (
        token?.ip === ip && 
        token?.state === enums.token_state_default
      ) {
        return {
          email, type, app, tenant, shared, code, createdAt, expiredAt
        };
      } if (
        token?.ip === ip && 
        token?.state !== enums.token_state_default
      ) {
        throw new Error('Ip not confirmed');
      } else if (token?.ip !== ip) {
        throw new Error('Token created from a different origin');
      }
      throw new Error('Token does not exist');
    });
};

schema.statics.check = function check(token, ip) {
  const { valid, data, err } = jwt.verify(token);
  if (!valid) {
    return Promise.reject(err);
  }
  return this.validateToken(data, ip);
};

schema.statics.invalidate = function invalidate(code) {
  return this.updateOne({ code }, { status: false });
}

module.exports = mongoose.model('tokens', schema);
