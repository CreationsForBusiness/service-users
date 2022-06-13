const mongoose = require('mongoose');

const { validateRandomString } = require('../libs/commons.lib');

const { Schema } = mongoose;

const errorCode = 'MDAP';

const schema = new Schema({
  code: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  shared: {
    type: Boolean,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

schema.statics.validateApp = function validateApp(code, uuid) {
  try {
    if (validateRandomString(uuid)) {
      return this.exists({ code, uuid })
        .then((app) => {
          if (!app) {
            throw new Error('The app-code and app-id are invalid');
          }
          return { valid: true };
        })
        .catch(({ message }) => Promise.resolve({
          valid: false, errorID: 2, errorCode, message,
        }));
    }
    throw new Error('The app-id is invalid or the version does not match');
  } catch ({ message }) {
    return Promise.resolve({
      valid: false, errorID: 1, errorCode, message,
    });
  }
};

schema.statics.isShared = function isShared(code) {
  return this.findOne({ code })
    .then(({ shared }) => (shared))
} 

module.exports = mongoose.model('apps', schema);
