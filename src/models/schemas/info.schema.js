const mongoose = require('mongoose');

const { Schema } = mongoose;

const Type = require('./type.schema');
const App = require('./app.schema');

const schema = new Schema({
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

schema.statics.infoFormat = function infoFormat(mail, type, hash, app, username, passwordActive) {
  return {
    mail,
    type: this.typeFormat(type, hash, username, passwordActive),
    app: this.appFormat(app),
  };
};
schema.statics.typeFormat = (type, hash, username, passwordActive) => (
  Type.statics.typeFormat(type, hash, username, passwordActive)
);

schema.statics.appFormat = (app) => App.statics.appFormat(app);

schema.statics.validatePassword = (username, type, hash) => (
  Type.statics.validatePassword(username, type, hash)
);

schema.statics.isPasswordActive = (types, type) => Type.statics.isPasswordActive(types, type);

module.exports = schema;
