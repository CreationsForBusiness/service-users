/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const fs = require('fs');
const path = require('path');
const Router = require('koa-router');

const router = Router();

const loadDir = (dirname = __dirname, prefix = '') => {
  fs
    .readdirSync(dirname)
    .filter((file) => ['.', 'index.js'].indexOf(file) < 0)
    .forEach((file) => {
      const pathFile = path.join(dirname, file);
      const prefixName = file.split('.').shift();
      const prefixRoute = [prefix, prefixName].filter((item) => item !== '').join('/');
      if (fs.statSync(pathFile).isDirectory()) {
        loadDir(pathFile, path.join(prefix, file));
      } else {
        router.use(`/${prefixRoute}`, require(pathFile).routes());
      }
    });
};

loadDir();

router.get('/', async (ctx) => {
  ctx.body = {
    running: true,
    app: ctx.app_name,
    version: ctx.version,
    env: ctx.env,
  };
});

module.exports = router;
