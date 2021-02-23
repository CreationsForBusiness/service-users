module.exports = {
  '/api/v1/auth_POST': {
    $schema: 'http://json-schema.org/draft-07/schema',
    $id: 'SignUp',
    type: 'object',
    title: 'User fields',
    description: 'User fields for signup',
    properties: {
      email: { type: 'string', format: 'email' },
      username: { type: 'string', format: 'username' },
      type: { type: 'string' },
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
      identifier: { type: 'string' },
      type: { type: 'string' },
      hash: { type: 'string' },
    },
    required: ['identifier', 'type', 'hash'],

  },
};
