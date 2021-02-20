const Router = require('koa-router');

const { database_fixed_values: enums } = require('../../constants');

const router = new Router();

const errorCode = 'RAUT';

const buildResponse = (ctx, response) => {
  if (
    !Object.prototype.hasOwnProperty.call(response, 'username')
    && Object.prototype.hasOwnProperty.call(response, 'message')
  ) {
    ctx.code = `${errorCode}-2`;
    ctx.throw(403, response.message);
  } else if (
    Object.prototype.hasOwnProperty.call(response, 'username')
    && Object.prototype.hasOwnProperty.call(response, 'message')
  ) {
    ctx.code = `${errorCode}-3`;
    ctx.throw(400, response.message);
  }
  return response;
}

const checkLoginType = (ctx, type) => {
  if (!Object.values(enums.login_types).includes(type)) {
    ctx.code = `${errorCode}-1`;
    ctx.throw(400, 'Login type is invalid');
  }
  return type;
}

router.post('/', async (ctx) => {
  const { request, models, app_code: appCode, source_ip:ip } = ctx;
  const { users } = models;
  const { body } = request;
  const {
    email, username, type, hash,
  } = body;
  const validType = checkLoginType(ctx, type);
  const { state = 500, ...signup } = await users.signup(email, username, validType, ip, hash, appCode);
  const response = buildResponse(ctx, signup);

  ctx.status = state;
  ctx.body = response;
});

router.post('/signin', async (ctx) => {
  const { request, models, app_code: appCode, source_ip:ip } = ctx;
  const { users } = models;
  const { body } = request;
  const {
    identifier, type, hash,
  } = body;
  const validType = checkLoginType(ctx, type);
  const { state = 500, ...signin } = await users.signin(identifier, validType, hash, ip);
  const response = buildResponse(ctx, signin);

  ctx.status = state;
  ctx.body =  response
});

module.exports = router;
