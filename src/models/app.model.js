const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema  = new Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('apps', schema);
