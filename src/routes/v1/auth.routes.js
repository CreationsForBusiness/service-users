const Router = require('koa-router');

const router = new Router();

router.post('/signup', async (ctx) => {
  console.log('JS');
  ctx.body = {};
});

router.post('/login', async (ctx) => {
  ctx.body = {};
});

module.exports = router;
