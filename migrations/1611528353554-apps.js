const Apps = require('../src/models/app.model');
const { getRandomString } = require('../src/libs/commons.lib');
const envelope = 'CFB_001';
const vetaux = 'CFB_002';

/**
 * Make any changes you need to make to the database here
 */
async function up () {
  return Promise.all([
    this('apps').create({ code: envelope, name: 'Envelopes', status: true, uuid: getRandomString() }),
    this('apps').create({ code: vetaux, name: 'VetAux', status: true, uuid: getRandomString() }),
  ]);
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down () {
  return Promise.all([
    this('apps').deleteOne({ code: envelope }),
    this('apps').deleteOne({ code: vetaux }),
  ]);
}

module.exports = { up, down };
