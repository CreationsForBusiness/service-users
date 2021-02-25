/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const fs = require('fs');
const path = require('path');
const Router = require('koa-router');
const yaml = require('js-yaml');

const fileyaml = fs.readFileSync(path.resolve(path.join('docs', 'api', 'v1.yaml')), 'utf8');

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
        router.use(`/api/${prefixRoute}`, require(pathFile).routes());
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

router.get('/apidoc', async (ctx) => {
  ctx.body = yaml.load(fileyaml);
})

module.exports = router;
