var server = require('../server.js');

var config = {
  "httpStatic": {
    "documentRoot": "www"
  }
};

var app = server.run(config);

describe('GET /users', function () {
  it('respond with json', function (done) {
    request(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  })
});