const path = require('path');
const MongoDriver = require('../drivers/mongo.driver');

module.exports = new MongoDriver(__dirname);