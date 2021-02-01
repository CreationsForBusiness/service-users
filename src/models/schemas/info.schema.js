const mongoose = require('mongoose');

const { Schema } = mongoose;

const Type = require('./type.schema');
const App = require('./app.schema');

const schema = new Schema({
  mail: {
    type: [String],
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

schema.statics.infoFormat = (mail, type, hash, app) => ({
  mail: [mail],
  type: Type.statics.typeFormat(type, hash),
  app: App.statics.appFormat(app),
});

schema.statics.typeFormat = (type, hash) => Type.statics.typeFormat(type, hash);

schema.statics.appFormat = (app) => App.statics.appFormat(app);

module.exports = schema;
