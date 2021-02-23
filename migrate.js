const { environments } = require('./src/constants');
const { mongo } = environments;
const { host = '', port = '', database = '', user = '', pass = '', prefix = '' } = mongo; 

const authUri = !!user && !!pass ? `${user}:${pass}@` : '';
const portUri = !!port && Number.isInteger(port) ? `:${port}` : '';

  console.log("#########", port, portUri)

const dbConnectionUri = `${prefix}://${authUri}${host}${portUri}/${database}`

module.exports = {
  dbConnectionUri,
  "migrations-dir": "./migrations"
}