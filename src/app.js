require('dotenv').config();
const Koa = require('koa');
const cors = require('@koa/cors');
const logger = require('koa-morgan');
const bodyParser = require('koa-bodyparser');

const { name, version } = require('../package.json');

const router = require('./routes');
const models = require('./models');
const middlewares = require('./middlewares');

const app = new Koa();

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
  ctx.models = models.mongoose.models;
  await next();
});

// Default error handler middleware
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.throw(404);
    }
  } catch (err) {
    ctx.status = ctx.status || err.statusCode || err.status || 500;
    ctx.code = ctx.code || 'UK01';
    ctx.body = {
      code: ctx.code,
      message: err.message,
    };
    ctx.app.emit('error', err, ctx);
  }
});

app.use(middlewares.auth);

app.use(router.routes());

// app.on('error', (err, ctx) => {
//   // log error
// });

module.exports = app;
