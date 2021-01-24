/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const driver = require('../drivers/mongo.driver');

const noModel = ['.', 'index.js', 'schemas'];
driver.connect();
fs
  .readdirSync(__dirname)
  .filter((file) => (noModel.indexOf(file) === -1))
  .forEach((file) => {
    require(path.join(__dirname, file));
  });

module.exports = driver;