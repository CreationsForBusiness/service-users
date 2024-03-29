require('dotenv').config();
const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const cors = require('@koa/cors');
const logger = require('koa-morgan');
const bodyParser = require('koa-bodyparser');

const { name, version } = require('../package.json');

const { environments } = require('./constants');

const router = require('./routes');
const models = require('./models');
const middlewares = require('./middlewares');

const app = new Koa();

// Static files
app.use(serve(path.join(__dirname, 'public')));

// Logger
app.use(
  logger('dev', {
    skip: () => app.env === 'test',
  }),
);

// Set types
app.use(
  bodyParser({
    enableTypes: ['json'],
    formLimit: '10mb',
    jsonLimit: '10mb',
  }),
);

// Enable CORS
app.use(cors());

// Context variable
app.use(async (ctx, next) => {
  ctx.app_name = name;
  ctx.version = version;
  ctx.env = app.env;
  ctx.models = models.instance.models;
  await next();
});

// Default error handler middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // will only respond with JSON
    const response = {
      code: ctx.code,
      message: err.message,
    };
    if (environments.debug) {
      response.description = err.stack;
    }
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = response;
  }
});
app.use(middlewares.validator);
app.use(middlewares.auth);
app.use(router.routes());

// app.use(async (ctx, next) => {
//   try {
//     console.log("DEFAULT HANDLER")
//     await next();
//     if (ctx.status === 404) {
//       ctx.throw(404);
//     }
//   } catch (err) {
//     ctx.status = ctx.status || err.statusCode || err.status || 500;
//     ctx.code = ctx.code || 'UK01';
//     ctx.body = {
//       code: ctx.code,
//       message: err.message,
//     };
//     ctx.app.emit('error', err, ctx);
//   }
// });

// app.on('error', (err, ctx) => {
//   // log error
// });

module.exports = app;
