const { environments } = require('./src/constants');
const { mongo } = environments;
const { host = '', port = '', database = '', user = '', pass = '' } = mongo; 

const authUri = !!user && !!pass ? `${user}:${pass}@` : '';
const portUri = !!port ? `:${port}` : '';

const dbConnectionUri = `mongodb://${authUri}${host}${portUri}/${database}`

module.exports = {
  dbConnectionUri,
  "migrations-dir": "./migrations"
}