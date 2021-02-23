module.exports = async (ctx, next) => {
  const { models } = ctx;
  const { apps } = models;
  const appCode = ctx.get('app-code');
  const appId = ctx.get('app-id');
  const ip = ctx.get('request-ip');
  const {
    valid, errorID, errorCode, message,
  } = await apps.validateApp(appCode, appId);
  if (!valid) {
    ctx.code = `${errorCode}-${errorID}`;
    ctx.throw(403, message);
  }
  ctx.app_code = appCode;
  ctx.source_ip = ip;
  await next();
};
