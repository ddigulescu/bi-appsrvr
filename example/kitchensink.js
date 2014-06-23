/**
 * Example with all features supported by bi-appsrvr.
 */

"use strict";

// Please note: require('../server.js') is only valid from within the example folder.
// When using the bi-appsrvr module in your own project, use require('bi-appsrvr').
var biappsrvr   = require('../server.js');
var fs          = require('fs');
var path        = require('path');

var consolidate     = require('consolidate');
var underscore      = require('underscore');
var LocalStrategy   = require('passport-local').Strategy;

var config = {
	'runMode': 'prod'
	,'requestLog': {
		'format': 'dev'
	}
	,'authentication': {
		'strategy': new LocalStrategy(function (username, password, done) {
			done(null, {id: username, username: username, password: password}); 
		})
	}
	,'websockets': {
		'clientETag': true
	}
	,'httpServer': {
		'host': process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
		'port': process.env.OPENSHIFT_NODEJS_PORT || 8080
	}
	,'httpsServer': {
		'host': '127.0.0.1',
		'port': 8081,
		'ssl': {
			'key': fs.readFileSync(path.resolve(__dirname, 'ssl', 'key.pem')),
			'cert': fs.readFileSync(path.resolve(__dirname, 'ssl', 'cert.pem')),
			'passphrase': 'test'
		}
	},
	'documentRoot': path.resolve(__dirname, 'www')
	,'cookieSession': {
		'secret': 'sessionSecret'
	}
	,'views': {
		'folder': path.resolve(__dirname, 'views')
		,'engines': [
			{ 'html': consolidate.underscore }
			,{ 'txt': consolidate.underscore }
		]
	}
}

var server = biappsrvr.Server();
var app = server.configure(config);

app.put('/users', function (req, res, next) {
	console.log('use');
	console.log(req.body, typeof req.body);
	res.end('ok');
});

app.get('/produceError', function (req, res, next) {
	x();
});

// Route GET /test/*, redirects to login page. 
app.get('/test/*', biappsrvr.Authenticator.forceLoginOnError, function (req, res, next) {
	res.end('route /test');
});

// Route GET /all*, allows all.
app.get('/all*', biappsrvr.Authenticator.allowAll, function (req, res, next) {
	res.end('all');
});

// Route GET /view/*. Get the matrix parameter from req.params. 
app.get('/view/:view', function (req, res, next) {
	var view = req.params.view;
	server.renderView(view, {msg: 'Hello World!'}, res, next);
});

// When using Passport, you MUST use the Passport instance exported by the server!
app.post('/login', biappsrvr.passport.authenticate('local', { failureRedirect: '/login' }));
app.get('/logout', function (req, res, next) {
	console.log('logout');
	next();
});

// socket.io handler.
// app.socketio.http.on('connection', function (socket) {
//  socket.emit('news', { hello: 'world' });
// });

server.start(function () {});
