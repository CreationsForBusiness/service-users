const { environments } = require('./src/constants');

const { mongo } = environments;
const {
  host = '', port = '', database = '', user = '', pass = '', prefix = '',
} = mongo;

const authUri = !!user && !!pass ? `${user}:${pass}@` : '';
const portUri = !!port && Number.isInteger(parseInt(port, 10)) ? `:${port}` : '';
const dbConnectionUri = `${prefix}://${authUri}${host}${portUri}/${database}`;

module.exports = {
  dbConnectionUri,
  'migrations-dir': './migrations',
};
