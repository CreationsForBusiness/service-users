const mongoose = require('mongoose');

const { Schema } = mongoose;

const { database_fixed_values: defaultValue } = require('../../constants');

const schema = new Schema({
  ip: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: defaultValue.user_register,
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

schema.statics.ipFormat = (ip, status = true) => ({ ip, status });

module.exports = schema;
