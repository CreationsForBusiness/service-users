const Router = require('koa-router');

const { database_fixed_values: enums } = require('../../constants');

const router = new Router();

const errorCode = 'RAUT';

router.post('/', async (ctx) => {
  const { request, models, app_code: appCode } = ctx;
  const { users } = models;
  const { body } = request;
  const {
    email, username, type, hash,
  } = body;
  const ip = ctx.get('request-ip');
  if (!Object.values(enums.login_types).includes(type)) {
    ctx.code = `${errorCode}-1`;
    ctx.throw(400, 'Login type is invalid');
  }
  const { state = 500, ...signup } = await users.signup(email, username, type, ip, hash, appCode);
  if (
    !Object.prototype.hasOwnProperty.call(signup, 'username')
    && Object.prototype.hasOwnProperty.call(signup, 'message')
  ) {
    ctx.code = `${errorCode}-2`;
    ctx.throw(403, signup.message);
  } else if (
    Object.prototype.hasOwnProperty.call(signup, 'username')
    && Object.prototype.hasOwnProperty.call(signup, 'message')
  ) {
    ctx.code = `${errorCode}-3`;
    ctx.throw(400, signup.message);
  }
  ctx.status = state;
  ctx.body = signup;
});

router.post('/login', async (ctx) => {
  ctx.body = {};
});

module.exports = router;
