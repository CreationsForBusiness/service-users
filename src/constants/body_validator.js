module.exports = {
  '/api/v1/auth/signup': {
    $schema: 'http://json-schema.org/draft-07/schema',
    $id: 'User',
    type: 'object',
    title: 'User fields',
    description: 'User fields for signup',
    properties: {
      email: { type: 'string', format: 'email' },
      username: { type: 'string', format: 'username' },
      type: { type: 'string' },
      ip: { type: 'string', format: 'ip' },
      hash: { type: 'string' },
    },
    required: ['email', 'username', 'type', 'ip', 'hash'],
  },
};
