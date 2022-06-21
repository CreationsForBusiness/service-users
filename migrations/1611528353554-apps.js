const mongoose = require('mongoose');

const Apps = require('../src/models/apps.model');
const { getRandomString } = require('../src/libs/commons.lib');
const envelope = 'CFB_001';
const vetaux = 'CFB_002';


/**
 * Make any changes you need to make to the database here
 */
async function up () {
  this('Apps', Apps);
  return Promise.all([
    this('Apps').create({ code: envelope, name: 'Envelopes', status: true, uuid: getRandomString(), shared: true, }),
    this('Apps').create({ code: vetaux, name: 'VetAux', status: true, uuid: getRandomString(), shared: false }),
  ]);
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down () {
  this('Apps', Apps);
  return Promise.all([
    this('Apps').deleteOne({ code: envelope }),
    this('Apps').deleteOne({ code: vetaux }),
  ]);
}

module.exports = { up, down };
