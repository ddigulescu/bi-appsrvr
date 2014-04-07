"use strict";

var express 		= require('express');
var http			= require('http');
var https			= require('https');
var socketio 		= require('socket.io');
var passport 		= require('passport');

module.exports.Authenticator 	= require('./lib/authenticate.js').Authenticator;
module.exports.run 				= run;
module.exports.renderView 		= renderView;

function renderView (view, data, res, next) {
	try {
	    res.render(view, data, function (error, html) {
	        if (error) {
	        	next(error);
	        } else {
	            res.end(html);
	        }
	    });
	} catch (error) {
		next(error);
	}
}

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

function run (config) {
	setupTerminationHandlers();

	var app = express()
		.use(express.cookieParser())
		.use(express.session(config.session))			
		.use(express.json())
		.use(express.urlencoded())
		//.use(express.multipart())
		//.use(express.csrf())
			
	// Configure Passport authentication. 
	if (config.authentication) {
		if (config.authentication.strategy) {
			passport.use(config.authentication.strategy);

			var users = {};
			passport.serializeUser(function(user, done) {
				users[user.id] = user;
				done(null, user);
			});

			passport.deserializeUser(function(user, done) {
				done(null, users[user.id]);
			});

			app.use(passport.initialize());
			app.use(passport.session());
		}

		app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }));
		app.get('/logout', function (req, res) {} );
	}
	
	// Configure view engine.
	if (config.views) {
		var viewFolder = config.views.folder || './views';
		app.set('views', viewFolder);
		config.views.engines.forEach(function (keyval) {
			for (var key in keyval) {
				app.engine(key, keyval[key]);	
			}
		});
	}

	// Create another app to have the application defined middlewares always before the static web server. 
	var theApp = express();
	app.use(theApp);

	// Configure static http middleware. 
	if (config.httpStatic && config.httpStatic.documentRoot) {
		app.use(express.static(config.httpStatic.documentRoot));
	}

	// Common error handler middleware.
	app.use(function (err, req, res, next) {
		res.redirect('/404.html');
		res.end();
	}); 	

	// Configure HTTP server. 
	if (config.httpServer) {
		var httpServer = http.createServer(app);
		httpServer.listen(config.httpServer.port, config.httpServer.host, function () {});
	}

	// Configure HTTPS server. 
	if (config.httpsServer) {
		var httpsServer = https.createServer(config.httpsServer.config, app);	
		httpsServer.listen(config.httpsServer.port, config.httpsServer.host, function () {});
	}

	// Configure socket.io.
	if (config.websockets) {
		if (config.httpServer) {
			var httpIo = ioconf(httpServer);
			// httpIo.sockets.on('connection', function (socket) {
			// 	console.log('client connected!');
			// });
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
	
	return theApp;
}