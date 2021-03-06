const mongoose = require('mongoose');

const { Schema } = mongoose;

const { database_fixed_values: enums } = require('../../constants');

const Password = require('./password.schema');

const schema = new Schema({
  code: {
    type: String,
    required: true,
    enum: enums.login_types,
  },
  password: {
    type: [Password],
    required: false,
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

schema.statics.typeFormat = (code, sha, email, passwordActive) => ({
  code,
  password: [Password.statics.passwordFormat(sha, email, code, passwordActive)],
});

schema.statics.validatePassword = (email, type, hash) => (
  Password.statics.validatePassword(email, type, hash)
);

schema.statics.isPasswordActive = (type, code) => Password.statics.isPasswordActive(type, code);

module.exports = schema;
