const mongoose = require('mongoose');

const { Schema } = mongoose;

const { database_fixed_values: enums } = require('../constants');

const Mail = require('./schemas/mail.schema');
const IP = require('./schemas/ip.schema');

const schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  mail: {
    type: [Mail],
    required: true,
    default: [],
  },

  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  state: {
    type: String,
    required: true,
    enum: enums.user_state,
  },
  ip_registered: {
    type: [IP],
    required: true,
  },
});

module.exports = mongoose.model('users', schema);
