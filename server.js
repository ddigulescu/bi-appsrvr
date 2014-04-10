"use strict";

var express 		= require('express');
var http			= require('http');
var https			= require('https');
var socketio 		= require('socket.io');
var passport 		= require('passport');
var fs 				= require('fs');

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

function getPageMaster () {

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
		.use(express.json())
		.use(express.urlencoded())
		//.use(express.multipart())
		//.use(express.csrf())
	
	// Configure sessions.
	if (config.session) {
		if (config.session.secret) {
			app.use(express.session(config.session));
		} else {
			errorAndExit('Missing configuration key "session.secret".');
		}
	}
			
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
		} else {
			errorAndExit('Missing configuration key "authentication.strategy".');
		}

		app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }));
		app.get('/logout', function (req, res) {} );
	}
	
	// Configure view engine.
	if (config.views) {
		var viewFolder = config.views.folder || 'views';
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
		if (config.httpStatic.documentRoot) {
			fs.open(config.httpStatic.documentRoot, 'r', function (error, stats) {
				if (error) {
					errorAndExit('Static HTTP document folder could not be found.');					
				} else {
					app.use(express.static(config.httpStatic.documentRoot));
				}
			});
		} else {
			errorAndExit('Missing configuration key "httpStatic.documentRoot".');
		}
		
	}

	// Common error middleware.
	app.use(function (err, req, res, next) {
		res.redirect('/404.html');
		res.end();
	});

	// Configure HTTP server. 
	if (config.httpServer) {
		var httpServer = http.createServer(app);
		if (!config.httpServer.port) {
			errorAndExit('Missing configuration key "httpServer.port".');	
		}
		if (!config.httpServer.host) {
			errorAndExit('Missing configuration key "httpServer.host".');	
		}
		httpServer.listen(config.httpServer.port, config.httpServer.host, function () {});
	}

	// Configure HTTPS server. 
	if (config.httpsServer) {
		if (!config.httpsServer.port) {
			errorAndExit('Missing configuration key "httpsServer.port".');
		}
		if (!config.httpsServer.host) {
			errorAndExit('Missing configuration key "httpsServer.host".');	
		}
		var httpsServer = https.createServer(config.httpsServer.config, app);	
		httpsServer.listen(config.httpsServer.port, config.httpsServer.host, function () {});
	}

	// Configure socket.io.
	if (config.websockets) {
		theApp.socketio = {};
		if (config.httpServer) {
			var httpIo = ioconf(httpServer);
			theApp.socketio.http = httpIo;
		}
		if (config.httpsServer) {
			var httpsIo = ioconf(httpsServer);
			theApp.socketio.https = httpsIo;
		}
	}

	// Configure logging.
	if (config.logging) {
		
	}

	function ioconf (server) {
		var io = socketio.listen(server)
		io.configure(function () {
			if (config.websockets.authorization) {
				// [TBD] Type check? 
				io.set('authorization', config.websockets.authorization);	
			}
			if (config.websockets.clientETag) {
				io.enable('browser client etag');	
			}
			if (config.websockets.log) {
				io.set('log level', config.websockets.log.level);
			}
		    
		});
		return io;
	}
	
	return theApp;
}

function errorAndExit (msg) {
	console.error(msg);
	process.exit(1);	
}