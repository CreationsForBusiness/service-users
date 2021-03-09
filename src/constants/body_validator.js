const { database_fixed_values: enums } = require('./index');

module.exports = {
  '/api/v1/auth_POST': {
    $schema: 'http://json-schema.org/draft-07/schema',
    $id: 'SignUp',
    type: 'object',
    title: 'User fields',
    description: 'User fields for signup',
    properties: {
      email: { type: 'string', format: 'email' },
      type: { type: 'string', enum: Object.values(enums.login_types) },
      hash: { type: 'string' },
    },
    required: ['email', 'type', 'hash'],
  },
  '/api/v1/auth/session_POST': {
    $schema: 'http://json-schema.org/draft-07/schema',
    $id: 'SignIn',
    type: 'object',
    title: 'Signin Form',
    description: 'User fields for signin',
    properties: {
      email: { type: 'string', format: 'email' },
      type: { type: 'string', enum: Object.values(enums.login_types) },
      hash: { type: 'string' },
    },
    required: ['email', 'type', 'hash'],

  },
};
