const mongoose = require('mongoose');

const { Schema } = mongoose;

const Type = require('./type.schema');
const App = require('./app.schema');

const schema = new Schema({
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

schema.statics.loginFormat = function loginFormat(email, type, hash, app, passwordActive) {
  return {
    type: this.typeFormat(email, type, hash, passwordActive),
    app: this.appFormat(app),
  };
};

schema.statics.typeFormat = (email, type, hash, passwordActive) => (
  Type.statics.typeFormat(email, type, hash, passwordActive)
);

schema.statics.appFormat = (app) => App.statics.appFormat(app);

schema.statics.passwordFormat = (email, login, hash, passwordActive, type) => (
  Type.statics.passwordFormat(email, login, hash, passwordActive, type)
)

schema.statics.validatePassword = (email, type, hash) => (
  Type.statics.validatePassword(email, type, hash)
);

schema.statics.isPasswordActive = (type) => Type.statics.isPasswordActive(type);

module.exports = schema;
