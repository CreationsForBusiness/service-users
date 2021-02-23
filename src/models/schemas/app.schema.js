const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
  code: {
    type: String,
    required: true,
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

schema.statics.appFormat = (code) => ({ code });

module.exports = schema;
