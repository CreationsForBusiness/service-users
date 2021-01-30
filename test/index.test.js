
const PORT = 8181;
process.env.PORT = PORT;
const server = require('../src');

afterAll(() => {
  server.close();
});

describe('Check service', () => {
  test('Services started', async () => {
    expect(server.listening).toBe(true);
  });
  test('Port binded', async () => {
    expect(server.address().port).toBe(PORT);
  });
});