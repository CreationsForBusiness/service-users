const mongoose = require('mongoose');

const { Schema } = mongoose;

const { database_fixed_values: enums } = require('../../constants');

const Password = require('./password.schema');

module.exports = new Schema({
  code: {
    type: String,
    required: true,
    enum: enums.login_types,
  },
  password: {
    type: [Password],
    required: true,
    default: [],
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
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
