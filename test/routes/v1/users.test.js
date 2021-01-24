const request = require('supertest');
const { app } = require('../../src');


describe('User path', () => {

  const endpoint = '/v1/users';

  test('Get user 200', async () => {
    const response = await request(app.callback()).get(endpoint);
    expect(response.status).toBe(200);
  });

  test('Get user object', async () => {
    const response = await request(app.callback()).get(endpoint);
    expect(response.body).toMatchObject({ });
  });

});