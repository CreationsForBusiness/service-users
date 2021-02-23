const { environments } = require('./src/constants');
const { mongo } = environments;
const { host = '', port = '', database = '', user = '', pass = '', prefix = '' } = mongo; 

const authUri = !!user && !!pass ? `${user}:${pass}@` : '';
const portUri = !!port && Number.isInteger(port) ? `:${port}` : '';
const dbConnectionUri = `${prefix}://${authUri}${host}${portUri}/${database}`

console.log("=======>", dbConnectionUri)


module.exports = {
  dbConnectionUri,
  "migrations-dir": "./migrations"
}