var connect 	= require('connect');
var http		= require('http');
var https		= require('https');
var socketio 	= require('socket.io');
var routermod	= require('./router.js');

module.exports.run = run;
module.exports.register = register;

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

function register (path, handler) {
	router.addRoute(path, handler);
}

function authauth (config) {
	return function authauth (req, res, next) {

		if (!req.session.authenticated) {
			if (config.always) {
				res.statusCode = 401;
				res.end();
				return;
			}
			console.log('not authenticated');
			req.session.authenticated = true;
		}
		if (req.session.authorized == false) {
			console.log('not authorized');	
		}
	 	next();
	}
}

var router;


function run (config) {
	setupTerminationHandlers();

	router = routermod.router();

	var app = connect()
			.use(connect.cookieParser())
			.use(connect.session(config.session))
			.use(connect.bodyParser())
			.use(connect.query())
			.use(connect.csrf())
			.use(authauth(config.authentication))
			.use(connect.static(config.htdocsFolder))
			.use(function (req, res, next) {
				router.handler(req, res, next)
			});

	if (config.httpServer) {
		var httpServer = http.createServer(app);
		httpServer.listen(config.httpServer.port, config.httpServer.host);
	}

	if (config.httpsServer) {
		var httpsServer = https.createServer(config.httpsServer.config, app);	
		httpsServer.listen(config.httpsServer.port, config.httpsServer.host);
	}

	if (config.websockets) {
		if (config.httpServer) {
			var httpIo = ioconf(httpServer);
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
	
	return {
		app: app,
		register: register,
		httpIo: httpIo,
		httpsIo: httpsIo
	};
}
