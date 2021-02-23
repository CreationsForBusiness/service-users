/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const fs = require('fs');
const path = require('path');

const middlewares = {};

fs
  .readdirSync(__dirname)
  .filter((file) => ['.', 'index.js'].indexOf(file) < 0)
  .forEach((file) => {
    const pathFile = path.join(__dirname, file);
    const middlewareName = file.split('.').shift();
    middlewares[middlewareName] = require(pathFile);
  });

module.exports = middlewares;
