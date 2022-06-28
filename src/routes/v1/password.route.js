const Router = require('koa-router');

const { database_fixed_values: enums, } = require('../../constants');

const { login_types: loginTypes } = enums;
const { password } = loginTypes;

const router = new Router();

const errorCode = 'UPAS';

router.put('/', async (ctx) => {
  const { request, models, app_code: appCode, source_ip: ip  } = ctx;
  const { body } = request;
  const { password: newPass, type } = body;
  const token = ctx.get('token');
  const tenant = ctx.get('tenant');

  const { err = false, error = false, data } = token
    ? await models.Users.getDataToken(token, tenant, appCode, ip).catch(err => ctx.throw(403, err))
    : { error: new Error('Token is missing') };

  if (err) {
    ctx.code = `${errorCode}-1`;
    ctx.throw(403, err);
  }
  if (error) {
    ctx.code = `${errorCode}-2`;
    ctx.throw(400, error);
  }
  
  if(type !== password) {
    ctx.code = `${errorCode}-3`;
    ctx.throw(400, `Login type ${type} doesnt allow change password`);
  }

  if(!data?.logins.includes(password)) {
    ctx.code = `${errorCode}-4`;
    ctx.throw(400, `Token not valid to use password`);
  }


  ctx.body = await models.Users.changePassword(data?.email, tenant, type, newPass)
  .catch(err => ctx.throw(400, err))
});

module.exports = router;
