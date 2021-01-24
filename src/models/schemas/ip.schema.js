const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports  = new Schema({
  ip: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: 'register',
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