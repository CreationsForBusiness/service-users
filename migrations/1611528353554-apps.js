const Apps = require('./models/app.model');
const { getRandomString } = require('./libs/commons.lib');
const code = 'CFB_001';

/**
 * Make any changes you need to make to the database here
 */
async function up () {
  return this('apps').create({ code, name: 'Envelopes', status: true, uuid: getRandomString() });
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down () {
  return this('apps').deleteOne({ code });
}

module.exports = { up, down };
