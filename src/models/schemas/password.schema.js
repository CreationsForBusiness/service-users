const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const { getRandomString } = require('../../libs/commons.lib');

const { database_fixed_values: defaultValue } = require('../../constants');

const schema = new Schema({
  sha: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: defaultValue.user_register,
  },
  state: {
    type: String,
    required: true,
    enum: defaultValue.password_state,
    default: defaultValue.password_state_default,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
  created: {
    type: Date,
    require: true,
    default: Date.now,
  },
  updated: {
    type: Date,
    require: true,
    default: Date.now,
  },
});

schema.statics.getPlain = (sha, type, email) => `${sha}-${type}-${email}`;

schema.statics.getHash = function getHash(sha, type, email) {
  const plain = this.getPlain(sha, type, email);
  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(plain, salt);
  return hash;
};

schema.statics.validateHash = function validateHash(sha, type, email, hash) {
  const plain = this.getPlain(sha, type, email);
  return bcrypt.compareSync(plain, hash);
};

schema.statics.isPasswordActive = function isPasswordActive(types, type) {
  const { state } = this.getPassword(types, type);
  return state === defaultValue.password_state_default;
};

schema.statics.getPassword = ({ password = [] }) => password
  .find(({ status }) => status) || {};

schema.statics.validatePassword = function validatePassword(email, type, string) {
  const { code } = type;
  const { sha } = this.getPassword(type);
  if (!sha) {
    return Promise.reject(new Error('Password missing'));
  }
  return Promise.resolve({ access: this.validateHash(string, code, email, sha) });
};

schema.statics.passwordFormat = function passwordFormat(password, email, login, active) {
  const code = getRandomString();
  const sha = this.getHash(password, login, email);
  const state = active
    ? defaultValue.password_state_default
    : defaultValue.password_state_default;
    //: defaultValue.password_state_waiting;
  return {
    sha, code, state,
  };
};

module.exports = schema;
