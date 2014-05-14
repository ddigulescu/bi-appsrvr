var server	= require('../server.js');
var fs 		= require('fs');

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
//	"httpsServer": {
//	 	"host": "127.0.0.1",
//	 	"port": 8081,
//	 	"config": {
//	 		"key": fs.readFileSync('./key.pem'),
//	 		"cert": fs.readFileSync('./cert.pem'),
//	 		"passphrase": "qwer1234"
//	 	}
//	},
	"httpStatic": {
		"documentRoot": "www"
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

// socket.io handler.
app.socketio.http.on('connection', function (socket) {
	setTimeout(function () {
		socket.emit('update', 'bar');
	},2000);
});
