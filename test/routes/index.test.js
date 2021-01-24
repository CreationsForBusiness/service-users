const request = require('supertest');
const { app } = require('../src');

describe('Default path', () => {

  const endpoint = '/';

  test('Get default 200', async () => {
    const response = await request(app.callback()).get(endpoint);
    expect(response.status).toBe(200);
  });

  test('Get default object', async () => {
    const response = await request(app.callback()).get(endpoint);
    expect(response.body).toMatchObject({ running: true, app: 'users', version: '1.0.0', env: 'test' });
  });

});