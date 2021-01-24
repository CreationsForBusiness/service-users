const mongoose = require('mongoose');
const { Schema } = mongoose;

const Mail = require('./schemas/mail.schema');
const App = require('./schemas/app.schema');
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
  app: {
    type: [App],
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  state: {
    type: String,
    required: true,
//    enum: Object.values(TypeBrandEnum)
  },
  ip_registered: {
    type: [IP],
    required: true,
  }
});

module.exports = mongoose.model('users', schema);
