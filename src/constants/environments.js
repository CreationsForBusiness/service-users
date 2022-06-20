const { env } = process;

module.exports = {
  debug: env.DEBUG === 'true',
  env: env.NODE_ENV,
  port: env.PORT || 3000,
  mongo: {
    host: env.MONGO_HOST || 'localhost',
    port: env.MONGO_PORT || '27017',
    database: env.MONGO_DATABASE || 'users',
    user: env.MONGO_USER,
    pass: env.MONGO_PASS,
    prefix: env.MONGO_PREFIX || 'mongodb',
    poolsize: env.MONGO_POOL_SIZE || 10,
    timeout: env.MONGO_TIMEOUT || 5000
  },
  jwt: {
    secret: env.JWT_SECRET || 'abc',
    expiresIn: parseInt(env.JWT_EXPIRES, 10) || 60, // minutes
  },
};
