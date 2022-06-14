const Router = require('koa-router');

const router = new Router();

const errorCode = 'RAUT';

const buildResponse = (ctx, response) => {
  const {
    is_new: isNew = false, is_modify: isModify = false, email, token = null,
  } = response;
  if (
    !Object.prototype.hasOwnProperty.call(response, 'email')
    && Object.prototype.hasOwnProperty.call(response, 'message')
  ) {
    ctx.code = `${errorCode}-2`;
    ctx.throw(403, response.message);
  } else if (
    Object.prototype.hasOwnProperty.call(response, 'email')
    && Object.prototype.hasOwnProperty.call(response, 'message')
  ) {
    ctx.code = `${errorCode}-3`;
    ctx.throw(400, response.message);
  }
  if (isNew) {
    ctx.status = 201;
  } else if (isModify) {
    ctx.status = 202;
  } else {
    ctx.status = 200;
  }
  return { email, token };
};

router.post('/', async (ctx) => {
  const {
    request, models, app_code: appCode, source_ip: ip,
  } = ctx;
  const { users } = models;
  const { body } = request;
  const {
    email, type, hash, tenant,
  } = body;
  const { ...signup } = await users
    .signup(email, type, ip, hash, tenant, appCode);
  const response = buildResponse(ctx, signup);

  ctx.body = response;
});

router.post('/session', async (ctx) => {
  const {
    request, models, app_code: appCode, source_ip: ip,
  } = ctx;
  const { users } = models;
  const { body } = request;
  const {
    email, type, hash, tenant
  } = body;
  const { ...signin } = await users.signin(email, type, hash, ip, tenant, appCode);
  const response = buildResponse(ctx, signin);

  ctx.body = response;
});

router.get('/session', async (ctx) => {
  const { models, source_ip: ip } = ctx;
  const token = ctx.get('token');
  const { users } = models;

  const { err = false, error = false, data } = token
    ? await users.getDataToken(token, ip)
    : { error: new Error('Token is missing') };

  if (err) {
    ctx.code = `${errorCode}-4`;
    ctx.throw(403, err);
  }
  if (error) {
    ctx.code = `${errorCode}-5`;
    ctx.throw(400, error);
  }

  ctx.body = data;
});

module.exports = router;
