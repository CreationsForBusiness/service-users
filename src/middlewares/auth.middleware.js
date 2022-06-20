const validRequest = ['/', '/favicon.ico', '/apidoc'];

module.exports = async (ctx, next) => {
  const { models, request } = ctx;
  const { url } = request;
  const appCode = ctx.get('app-code');
  const appId = ctx.get('app-id');
  const ip = ctx.get('client-ip').replace('::ffff:', '');
  const isValidRequest = validRequest.includes(url);
  const {
    valid, errorID, errorCode, message,
  } = isValidRequest ? { valid: true } : await models.Apps.validateApp(appCode, appId);

  if (!valid) {
    ctx.code = `${errorCode}-${errorID}`;
    ctx.throw(403, message);
  }

  if (!isValidRequest && !(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}|::1|127.0.0.1$/.test(ip))) {
    ctx.code = 'MAUT-1';
    ctx.throw(403, 'Invalid IP');
  }
  ctx.app_code = appCode;
  ctx.source_ip = ip;
  await next();
};
