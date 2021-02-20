const jwt = require('jsonwebtoken');

const { environments } = require('../constants');

const { jwt: jwtEnv } = environments;
const { secret, expiresIn } = jwtEnv;

class Token {
  constructor() {
    this.token = secret;
  }

  static getExp() {
    return expiresIn * 60;
  }

  generate(data) {
    const options = {
      expiresIn: this.constructor.getExp(),
    };
    return jwt.sign(data, this.token, options);
  }

  verify(token) {
    try {
      return jwt.verify(token, this.token);
    } catch (err) {
      return { valid: false, err };
    }
  }
}

module.exports = new Token();
