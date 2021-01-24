const app = require('./app');

const { PORT = 5000 } = process.env;

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`); // eslint-disable-line no-console
});

module.exports = server;
