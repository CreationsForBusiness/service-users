const app = require('./app');

const { environments } = require('./constants');

const { port: PORT } = environments;

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = server;
