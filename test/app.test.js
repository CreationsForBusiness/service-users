const request = require('supertest');
const { app } = require('./src');


describe('404 path', () => {

  const endpoint = '/404';

  test('Get 404', async () => {
    const response = await request(app.callback()).get(endpoint);
    expect(response.status).toBe(404);
  });

  test('Get default object', async () => {
    const response = await request(app.callback()).get(endpoint);
    expect(typeof response.body).toBe('object');
  });

});