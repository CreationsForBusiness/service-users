const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports  = new Schema({
  code: {
    type: String,
    required: true,
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