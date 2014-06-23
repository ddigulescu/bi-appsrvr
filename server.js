"use strict";

var express         = require('express');
var http            = require('http');
var https           = require('https');
var socketio        = require('socket.io');
var passport        = require('passport');
var fs              = require('fs');
var util            = require('util');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');
var busboy          = require('connect-busboy');
var morgan          = require('morgan');
var errorhandler    = require('errorhandler');
var path            = require('path');
var yargs           = require('yargs');

module.exports.Authenticator        = require('./lib/authenticate.js').Authenticator;
module.exports.commandlineArguments = commandlineArguments;
module.exports.passport             = passport;
module.exports.Server               = server;

function commandlineArguments () {
	var args = yargs.usage('$0 --config configfile --mode [prod|test|dev]').argv;
	if ((args.config && typeof args.config !== 'string') || (args.mode && typeof args.mode !== 'string')) {
		yargs.showHelp();
	}
	return args;
}

function server (config) {

	setupTerminationHandlers();

	var app;
	var httpServer;
	var httpsServer;
	var config;

	return {
		configure: configure
		,start: start
		,stop: stop
	}

	function stop () {
		if (httpServer) {
			httpServer.close();
		}
		if (httpsServer) {
			httpsServer.close();
		}
	}

	function start (cb) {
		var Page500Exists = fs.existsSync(path.resolve(config.documentRoot, '500.html'));
		var Page404Exists = fs.existsSync(path.resolve(config.documentRoot, '404.html'));

		// 404 handler.
		app.use(function (req, res, next) {
			res.status(404);
			if (Page404Exists) {
				res.redirect('/404.html');
			} else {
				res.end('Page not found.'); 
			}   
		});

		// Error handler.
		if (config.runMode === 'development') {
			app.use(errorhandler());
		} else {
			app.use(function (err, req, res, next) {
				res.status(500);
				if (Page500Exists) {
					res.redirect('/500.html');
				} else {
					res.end('Internal server error.');
				}
			}); 
		}

		var c = httpServer && httpsServer ? 2 : 1;
		if (httpServer) {
			httpServer.listen(config.httpServer.port, config.httpServer.host, function () {
				console.log('%s: HTTP server %s:%s started.', Date(Date.now()), config.httpServer.host, config.httpServer.port);
				callback(--c);
			});
		}
		if (httpsServer) {
			httpsServer.listen(config.httpsServer.port, config.httpsServer.host, function () {
				console.log('%s: HTTPS server %s:%s started.', Date(Date.now()), config.httpsServer.host, config.httpsServer.port);
				callback(--c);
			});
		}

		function callback () {
			if (cb && c === 0) {
				cb();
			}
		}
	}

	function configure (cfg) {
		config = cfg;
		app = express();
		app.disable('x-powered-by');
		
		app
			.use(cookieParser())        
			.use(bodyParser())
			.use(busboy());
			//.use(express.csrf())
			
		// Configure cookie sessions.
		// [TBD]
		if (config.cookieSession) {
			if (config.cookieSession.secret) {
				app.use(session(config.cookieSession));
			} else {
				configError('Missing configuration key "session.secret".');
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
				configError('Missing configuration key "authentication.strategy".');
			}
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

		// Configure static HTTP middleware. 
		if (config.documentRoot) {
			fs.open(config.documentRoot, 'r', function (error, stats) {
				if (error) {
					configError('Document root folder could not be found.');                    
				} else {
					app.use(express.static(config.documentRoot));
				}
			});
		}

		// Configure request logging.
		if (config.requestLog) {
			app.use(morgan(config.requestLog));
		}

		// Configure HTTP[S] server. 
		if (!config.httpServer && !config.httpsServer) {
			config.httpServer = {
				host: '127.0.0.1'
				,port: 8080
			};
			httpServer = configureHttpServer(config.httpServer, app);
		}
		if (config.httpServer) {
			httpServer = configureHttpServer(config.httpServer, app);
		}
		if (config.httpsServer) {
			httpsServer = configureHttpServer(config.httpsServer, app)
		}

		// Configure socket.io.
		if (config.websockets) {
			app.socketio = {};
			if (config.httpServer) {
				app.socketio.http = configAndAttachSocketIO(config.websockets, httpServer);
			}
			if (config.httpsServer) {
				app.socketio.https = configAndAttachSocketIO(config.websockets, httpsServer);
			}
		}

		return app;
	}
}

function configError (msg) {
	console.error(msg);
	process.exit(1);    
}

function configureHttpServer (config, app) {
	var module = config.ssl ? https : http;
	var type = config.ssl ? 'https' : 'http';
	if (!config.port) {
		configError(util.format('Missing configuration key "%sServer.port".'), type);   
	}
	if (!config.host) {
		configError(util.format('Missing configuration key "%sServer.host".'), type);   
	}
	var server = module.createServer.apply(module, config.ssl ? [config.ssl, app] : [app]);
	server.on('error', function (e) {
		if (e.code == 'EADDRINUSE') {
			configError(util.format('Address %s:%s already in use.', config.host, config.port));
		}
	});
	return server;
}

function configAndAttachSocketIO (config, server) {
	var ioServer = new socketio(config);
	ioServer.attach(server)
	return ioServer;
}

function setupTerminationHandlers() {
	//  Process on exit and signals.
	process.on('exit', function() { terminator(); });

	// Removed 'SIGPIPE' from the list - bugz 852598.
	['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
	 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
	].forEach(function(element, index, array) {
		process.on(element, function() { terminator(element); });
	});

	function terminator(sig) {
		if (typeof sig === "string") {
		   console.log('%s: Received %s - terminating app ...', Date(Date.now()), sig);
		   process.exit(1);
		}
		console.log('%s: Node server stopped.', Date(Date.now()) );
	};
};

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
