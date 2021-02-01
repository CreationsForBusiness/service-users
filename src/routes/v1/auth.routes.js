const Router = require('koa-router');

const { database_fixed_values: enums } = require('../../constants');

const router = new Router();

const errorCode = 'RAUT';

router.post('/signup', async (ctx) => {
  const { request, models, app_code: appCode } = ctx;
  const { users } = models;
  const { body } = request;
  const {
    email, username, type, ip, hash,
  } = body;
  if (!Object.values(enums.login_types).includes(type)) {
    ctx.code = `${errorCode}-1`;
    ctx.throw(400, 'Login type is invalid');
  }
  const signup = await users.signup(email, username, type, ip, hash, appCode);

  ctx.body = signup;
});

router.post('/login', async (ctx) => {
  ctx.body = {};
});

module.exports = router;
