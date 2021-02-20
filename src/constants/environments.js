const { env } = process;

module.exports = {
  debug: env.DEBUG === 'true',
  env: env.NODE_ENV,
  port: env.PORT || 5000,
  mongo: {
    host: env.MONGO_HOST || 'localhost',
    port: env.MONGO_PORT || '27017',
    database: env.MONGO_DATABASE || 'users',
    user: env.MONGO_USER,
    pass: env.MONGO_PASS,
  },
  jwt: {
    secret: env.JWT_SECRET || 'abc',
    expiresIn: parseInt(env.JWT_EXPIRES, 10) || 60, // minutes
  },
};
