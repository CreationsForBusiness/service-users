const mongoose = require('mongoose');

const { validate: uuidValidate, version: uuidGetVersion } = require('uuid');

const { uuid_version: uuidVersion } = require('../constants');

const { Schema } = mongoose;

const errorCode = 'AUTH';

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
  status: {
    type: Boolean,
    required: true,
  },
});

schema.statics.validateApp = function validateApp(code, uuid) {
  try {
    if (uuidValidate(uuid) && uuidGetVersion(uuid) === uuidVersion) {
      return this.countDocuments({ code, uuid })
        .then((app) => {
          if (app === 0) {
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

module.exports = mongoose.model('apps', schema);
