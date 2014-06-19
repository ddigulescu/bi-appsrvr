"use strict";

//
// Requiring ../server.js is only valid from within the example folder.
// When requiring the bi-appsrvr module as a dependency, use require('bi-appsrvr').
var server	= require('../server.js');
var fs 		= require('fs');
var path 	= require('path');

var consolidate 	= require('consolidate');
var underscore 		= require('underscore');
var LocalStrategy 	= require('passport-local').Strategy;

var config = {
	"environment": {
	}
	,"logging": {
		"request": "test"
		,"level": "info"
		,"folder": "logs"
	}
	,"authentication": {
		"strategy": new LocalStrategy(function (username, password, done) {
			done(null, {id: username, username: username, password: password});	
		})
	}
	,"websockets": {
		"clientETag": true,
		"log": {
			"level": 0
		}
	}
	,"httpServer": {
		"host": process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
		"port": process.env.OPENSHIFT_NODEJS_PORT || 1337
	},
	"httpsServer": {
	 	"host": "127.0.0.1",
	 	"port": 8081,
	 	"ssl": {
	 		"key": fs.readFileSync('./key.pem'),
	 		"cert": fs.readFileSync('./cert.pem'),
	 		"passphrase": "qwer1234"
	 	}
	},
	"httpStatic": {
		"documentRoot": path.resolve(__dirname, "www")
	}
	,"session": {
		"secret": "sessionSecret"
	}
	,"views": {
		"folder": "./views"
		,"engines": [
			{ "html": consolidate.underscore }
			,{ "txt": consolidate.underscore }
		]
	}
}

var app = server.run(config);

// Route GET /test/*, redirects to login page. 
app.get('/test/*', server.Authenticator.forceLoginOnError, function (req, res, next) {
	res.end('route /test');
});

// Route GET /all*, allows all.
app.get('/all*', server.Authenticator.allowAll, function (req, res, next) {
	res.end('all');
});

// Route GET /view/*. Get the matrix parameter from req.params. 
app.get('/view/:view', function (req, res, next) {
    var view = req.params.view;
    server.renderView(view, {msg: 'Hello World!'}, res, next);
});

// When using Passport, you MUST use the Passport instance exported by the server!
app.post('/login', server.passport.authenticate('local', { failureRedirect: '/login' }));
app.get('/logout', function (req, res) {} );

// socket.io handler.
app.socketio.http.on('connection', function (socket) {
	setTimeout(function () {
		socket.emit('update', 'bar');
	},2000);
});
