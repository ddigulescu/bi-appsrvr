"use strict";

var express 		= require('express');
var http			= require('http');
var https			= require('https');
var socketio 		= require('socket.io');
//var passport 		= require('passport');
//var LocalStrategy 	= require('passport-local').Strategy;

module.exports.run = run;
//module.exports.passport = passport;




//
// The following two functions are taken from the Openshift node.js sample app.
//
function terminator(sig) {
    if (typeof sig === "string") {
       console.log('%s: Received %s - terminating app ...',
                   Date(Date.now()), sig);
       process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()) );
};

 function setupTerminationHandlers() {
    //  Process on exit and signals.
    process.on('exit', function() { terminator(); });

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { terminator(element); });
    });
};

function authauth (config) {
	var config = config || {};
	return function authauth (req, res, next) {

		if (!req.session.authenticated) {
			if (config.always) {
				res.statusCode = 401;
				res.end();
				return;
			}
			//console.log('not authenticated');
			req.session.authenticated = true;
		}
		if (req.session.authorized == false) {
			//console.log('not authorized');	
		}
	 	next();
	}
}

function run (config) {
	setupTerminationHandlers();

	var app = express()
			.use(express.cookieParser())
			.use(express.session(config.session))			
			.use(express.json())
			.use(express.urlencoded())
			//.use(express.multipart())
			//.use(express.csrf())
			.use(express.static(config.htdocsFolder));


 	// [TBD] Should define an error handler as the last middleware. 

	if (config.httpServer) {
		var httpServer = http.createServer(app);
		httpServer.listen(config.httpServer.port, config.httpServer.host, function () {
			//console.log('HTTP server started on %s:%d.', config.httpServer.host, config.httpServer.port);
		});
	}

	if (config.httpsServer) {
		var httpsServer = https.createServer(config.httpsServer.config, app);	
		httpsServer.listen(config.httpsServer.port, config.httpsServer.host, function () {
			//console.log('HTTPS server started  on %s:%d.', config.httpsServer.host, config.httpsServer.port);
		});
	}

	if (config.websockets) {
		if (config.httpServer) {
			var httpIo = ioconf(httpServer);

			httpIo.sockets.on('connection', function (socket) {
				console.log('client connected!');
			});
		}
		if (config.httpsServer) {
			var httpsIo = ioconf(httpsServer);
		}
	}

	function ioconf (server) {
		var io = socketio.listen(server)
		io.configure(function () {
			if (config.websockets.authorization) {
				io.set('authorization', config.websockets.authorization);	
			}
			if (config.websockets.clientETag) {
				io.enable('browser client etag');	
			}
		    io.set('log level', config.websockets.log.level);
		});
		return io;
	}
	
	return app;
}