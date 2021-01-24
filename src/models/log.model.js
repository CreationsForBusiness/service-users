const mongoose = require('mongoose');
const { Schema } = mongoose;

const { database_fixed_values:enums } = require('../constants');

const Mail = require('./schemas/mail.schema')
const App = require('./schemas/app.schema')

const schema = new Schema({
  user: {
    type: Schema.ObjectId,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: enums.user_actions,
  },
  app: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    require: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('access', schema);
