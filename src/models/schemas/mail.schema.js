const mongoose = require('mongoose');

const { Schema } = mongoose;

const Type = require('./type.schema');
const App = require('./app.schema');

module.exports = new Schema({
  mail: {
    type: String,
    required: true,
  },
  type: {
    type: [Type],
    required: true,
  },
  app: {
    type: [App],
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
