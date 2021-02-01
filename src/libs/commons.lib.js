const {
  v4, v5, validate: uuidValidate, version: uuidGetVersion,
} = require('uuid');

module.exports = {
  getRandomNumber(min = 0, max = 10, pad = 2) {
    const random = Math.random() * (max - min) + min;
    return parseInt(random.toString().padStart(pad, 0), 10);
  },
  getRandomString(seed) {
    if (!seed) {
      return v4();
    }
    return v5(seed, v5.URL);
  },
  validateRandomString(string, seed) {
    const version = seed ? 5 : 4;
    return uuidValidate(string) && uuidGetVersion(string) === version;
  },
};
