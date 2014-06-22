"use strict";

var biappsrvr   = require('../server.js');
var request     = require('supertest');
var assert      = require('assert');
var path        = require('path');
var fs          = require('fs');
var should      = require('should');

var app;
var agent;

function setup (done) {
    var config = {
        'httpServer': {
            'host': process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
            'port': process.env.OPENSHIFT_NODEJS_PORT || 8080
        }
        ,'documentRoot': path.resolve(__dirname, 'www')
        ,'session': {
            'secret': '53cr37'
        }
    };
    var server = biappsrvr.Server();
    var app = server.configure(config);


    app.get('/users', function (req, res, next) {
        res.json(200, {});
    });

    app.put('/users', function (req, res, next) {
        var data = req.body;
        assert.equal('object', typeof data, 'Should be an object.');
        res.status(200);
        res.end();
    });

    app.post('/upload', function (req, res, next) {
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            assert.equal(fieldname, 'theFile');
            file.on('data', function(data) {});
        });
        req.busboy.on('finish', function() {
            res.status(200);
            res.end();
        });

        req.pipe(req.busboy);
    });

    app.post('/bodyparser', function (req, res, next) {
        assert.equal(typeof req.body, 'object');
        assert.equal(typeof req.body.firstname, 'string');
        assert.equal(typeof req.body.age, 'string');
        assert.equal(typeof req.body.ampersand, 'string');
        assert.equal(typeof req.query, 'object');
        assert.equal(req.query.foo, 'bar');
        console.log(req.query);
        res.status(200);
        res.end();
    });

    app.get('/session', function (req, res, next) {
        if (req.session.foo) {
            res.end(req.session.foo);
        } else {
            req.session.foo = req.query.foo;
            res.end();
        }
    });

    server.start(function () {
        agent = request.agent(app);
        done();
    });
}



describe('The server test suite should', function () {
    
    before(setup);

    describe('GET /session', function () {
        it('and should receive session cookie', function (done) {
            agent
                .get('/session')
                .query('foo=bar')
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res.headers['set-cookie']);
                    res.headers['set-cookie'][0].should.startWith('connect.sid');
                    res.status.should.equal(200);
                    done();
                });
            });

        it('should receive the value "bar" from the session key "foo"', function (done) {
            agent
                .get('/session')
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('POST /bodyparser with application/x-www-form-urlencoded data', function () {
        it('should receive status 200', function (done) {
            agent
                .post('/bodyparser')
                .query('foo=bar')
                .send('firstname=Joe')
                .send('age=26')
                .send('ampersand=%26')
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('POST /upload', function () {
        it('should send a file and receive status 200', function (done) {
            agent
                .post('/upload')
                .attach('theFile', path.resolve(__dirname, 'schrodingers-lolcat.jpg'))
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('The JSON suite should', function () {
        describe('GET /users', function () {
            it('and should receive json data', function (done) {
                agent
                    .get('/users')
                    .set('Accept', 'application/json')
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.headers['content-type'].indexOf('json').should.not.equal(-1);
                        res.status.should.equal(200);
                        done();
                    });
            });
        });

        describe('PUT /users', function () {
            it('and should receive status code 200', function (done) {
                agent
                    .put('/users')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify({ foo: 'bar' }))
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.status.should.equal(200);
                        done();
                    });
            });
        });

        describe('PUT /users with malformed JSON', function () {
            it('and should receive status code 400', function (done) {
                agent
                    .put('/users')
                    .set('Content-Type', 'application/json')
                    .send('{')
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.status.should.equal(400);
                        done();
                    });
            });
        });
    });

    describe('The static test suite should', function () {
        describe('GET /index.html', function () {
            var text;
            it('and should receive status 200 and content-type "text/html"', function (done) {
                agent
                    .get('/index.html')
                    .set('Accept', 'text/html')
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.status.should.equal(200);
                        res.headers['content-type'].should.startWith('text/html');
                        text = res.text;
                        done()
                    });
            });
            it('and the response should be the same as when read from the file system', function (done) {
                var file = fs.readFileSync(path.resolve(__dirname, 'www', 'index.html')).toString();
                text.should.equal(file);
                done();
            });
        });
    });
});

