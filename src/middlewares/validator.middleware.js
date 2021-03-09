const Validator = require('ajv').default;
const schemas = require('../constants/body_validator');

const validator = new Validator();

const validateFormat = (expr, input) => new RegExp(expr).test(input);

validator.addFormat('email', { validate: (input) => validateFormat(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, input) });

module.exports = async (ctx, next) => {
  const { originalUrl, request } = ctx;
  const { method } = request;
  const { body } = request;
  const schemaName = `${originalUrl}_${method}`;
  const { [schemaName]: schema = {} } = schemas;
  const validate = validator.compile(schema);
  const valid = validate(body, schema);
  if (!valid) {
    ctx.code = 'MWVA-001';
    ctx.throw(400, validator.errorsText(validate.errors));
  }
  await next();
};
