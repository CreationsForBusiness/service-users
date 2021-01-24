const mongoose = require('mongoose');
const { Schema } = mongoose;

const Password = require('./password.schema');

module.exports  = new Schema({
  code: {
    type: String,
    required: true,
    default: 'register',
//    enum: Object.values(TypeBrandEnum)
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