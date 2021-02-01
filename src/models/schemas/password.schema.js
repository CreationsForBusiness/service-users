const mongoose = require('mongoose');

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

schema.statics.passwordFormat = (sha, type) => {
  const code = getRandomString();
  return { sha, type, code };
};

module.exports = schema;
