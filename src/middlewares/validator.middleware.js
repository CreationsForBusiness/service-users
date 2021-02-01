const Validator = require('ajv').default;
const { validator: schemas } = require('../constants');

const validator = new Validator();

const validateFormat = (expr, input) => new RegExp(expr).test(input);

validator.addFormat('email', { validate: (input) => validateFormat(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, input) });
validator.addFormat('ip', { validate: (input) => validateFormat(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, input) });
validator.addFormat('username', { validate: (input) => validateFormat(/^[A-Za-z]+/, input) });

module.exports = async (ctx, next) => {
  const { originalUrl, request } = ctx;
  const { body } = request;
  const { [originalUrl]: schema = {} } = schemas;
  const validate = validator.compile(schema);
  const valid = validate(body, schema);
  if (!valid) {
    ctx.code = 'MWVA-001';
    ctx.throw(400, validator.errorsText(validate.errors));
  }
  await next();
};
