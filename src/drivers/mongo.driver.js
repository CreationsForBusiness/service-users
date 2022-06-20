/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const { environments } = require('../constants');
const { env, mongo, debug } = environments;
const {
  host, port, database, user = false, pass = false, prefix, poolsize, timeout
} = mongo;

class MongoDatabase {
  constructor(modelDirectory, tenant) {
    this.modelDirectory = modelDirectory
    this.env = env;
    this.db = database;
    this.port = !!port && Number.isInteger(parseInt(port, 10)) ? `:${port}` : '';
    this.dbURI = `${prefix}://${host}${this.port}/${this.db}`;
    this.instance = false;

    this.dbOption = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      autoIndex: true,
      poolSize: poolsize,
      serverSelectionTimeoutMS: timeout,
      logger: console.log,
      loggerLevel: debug ? 'debug' : 'info',
    };
    if (user !== false && pass !== false) {
      this.dbOption.auth = { authSource: 'admin' };
      this.dbOption.user = user;
      this.dbOption.pass = pass;
    }
    this.connect();

  }

  setNotifications(connection) {
    connection.on('error', (err) => {
      console.error(`Error connecting to MongoDb @ ${this.dbURI}: ${err.message}`)
    });
    connection.on('connecting', () => {
      console.log(`Connecting to MongoDB @ ${this.dbURI}`);
    });
    connection.on('connected', () => {
      console.log(`Successfully connected to MongoDB @ ${this.dbURI} `);
    });
    connection.on('reconnected', () => {
      console.log(`Reconnected to MongoDB @ ${this.dbURI}`);
    });
    connection.on('disconnecting', () => {
      console.log(`Disconnecting from MongoDB @ ${this.dbURI}`);
    });
    connection.on('disconnected', () => {
      console.log(`Disconnected from MongoDB @ ${this.dbURI}`);
    });
    connection.on('close', () => {
      console.log(`Client MongoDB closed @ ${this.dbURI}`);
    });
    connection.on('close', () => {
      console.log(`Client MongoDB closed @ ${this.dbURI}`);
    });
  }

  bindModels(directory) {
    fs
      .readdirSync(this.modelDirectory)
      .filter((file) => (!['.', 'index.js', 'schemas', directory].includes(file)))
      .forEach((file) => {
        const [name] = file.split('.');
        const model = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
        const modelPath = path.join(this.modelDirectory, file);
        const schema = require(modelPath);
        this.instance.model(model, schema);
      });
  }


  connect () {
    if (this.instance === false) {
      this.instance = mongoose.createConnection(this.dbURI, this.dbOption)
      this.instance.catch(err => {
        console.error(new Error(`Error on start mongo connection: ${err.message}`));
      });
      this.bindModels(this.modelDirectory)
      this.setNotifications(this.instance.client)
    }
    console.log(`Instance started @ ${this.dbURI}`);
    return true
  }

}

module.exports = MongoDatabase
