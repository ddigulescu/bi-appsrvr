/**
 * Example with static HTTP server only.
 */

"use strict";

// Please note: require('../server.js') is only valid from within the example folder.
// When using the bi-appsrvr module in your own project, use require('bi-appsrvr').
var biappsrvr	= require('../server.js');
var path 		= require('path');

// This is the most basic server configuration.
// When no HTTP or HTTPS server is configured, an HTTP server at 127.0.0.1:8080 will be created.
var config = {
	'documentRoot': path.resolve(__dirname, 'www')
};

var server = biappsrvr.Server();
var app = server.configure(config);
server.start();