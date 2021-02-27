const mongoose = require('mongoose');
const { environments } = require('../constants');

const { env, mongo, debug } = environments;

const {
  host, port, database, user = false, pass = false, prefix,
} = mongo;

class MongoDatabase {
  constructor() {
    this.env = env;
    this.mongoose = mongoose;
    this.db = database;
    this.port = !!port && Number.isInteger(parseInt(port, 10)) ? `:${port}` : '';
    this.dbURI = `${prefix}://${host}${this.port}/${this.db}`;
    this.reconnectInterval = 1500;
    this.mongoose.set('debug', debug);
    this.mongoose.Promise = global.Promise;
    this.instance = false;
    this.retry = 0;
    this.dbOption = {
      useNewUrlParser: true,
      useCreateIndex: true,
      poolSize: 10,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };
    if (user !== false && pass !== false) {
      this.dbOption.auth = { authSource: 'admin' };
      this.dbOption.user = user;
      this.dbOption.pass = pass;
    }
    this.events(this);
  }

  events() {
    this.mongoose.connection.on('error', (err) => {
      console.log('MONGO 1', new Error(`Error connecting ${this.retry} to MongoDb @ ${this.dbURI}: ${err.message}`));
      this.mongoose.disconnect();
    });
    this.mongoose.connection.on('connecting', () => {
      console.log(`Connecting to MongoDB @ ${this.dbURI}`);
    });
    this.mongoose.connection.on('connected', () => {
      console.log(`Successfully connected to MongoDB @ ${this.dbURI} `);
      this.instance = true;
    });
    this.mongoose.connection.on('reconnected', () => {
      console.log(`Reconnected to MongoDB @ ${this.dbURI}`);
    });
    this.mongoose.connection.on('disconnected', () => {
      console.log(`Disconnected from MongoDB @ ${this.dbURI}`);
    });
  }

  connect() {
    if (this.instance === false) {
      this.retry += 1;
      this.mongoose.connect(this.dbURI, this.dbOption)
        .catch((err) => {
          console.log('MONGO 2', new Error(`Error on start mongo connection: ${err.message}`));
          this.instance = false;
          this.timeout = setTimeout(this.connect.bind(this), this.reconnectInterval);
        });
    } else {
      console.log(`Already connected to MongoDB @ ${this.dbURI}`);
    }
    return true;
  }
}

module.exports = new MongoDatabase();
