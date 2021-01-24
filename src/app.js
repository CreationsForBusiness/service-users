require('dotenv').config();
const Koa = require('koa');
const cors = require('@koa/cors');
const logger = require('koa-morgan');
const bodyParser = require('koa-bodyparser');

const { name, version } = require('../package.json');

const router = require('./routes');

const app = new Koa();

// Set middlewares
app.use(
  bodyParser({
    enableTypes: ['json', 'form'],
    formLimit: '10mb',
    jsonLimit: '10mb',
  }),
);

// Logger
app.use(
  logger('dev', {
    skip: () => app.env === 'test',
  }),
);

// Context variable
app.use(async (ctx, next) => {
  ctx.app_name = name;
  ctx.version = version;
  ctx.env = app.env;
  next();
});

// Enable CORS
app.use(cors());

app.use(router.routes());

// Default error handler middleware
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.throw(404);
    }
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.code = ctx.code || 'UK01';
    ctx.body = {
      code: ctx.code,
      message: err.message,
    };
    ctx.app.emit('error', err, ctx);
  }
});

module.exports = app;
