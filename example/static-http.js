"use strict";

//
// Requiring ../server.js is only valid from within the example folder.
// When requiring the bi-appsrvr module as a dependency, use require('bi-appsrvr').
var server	= require('../server.js');
var path 	= require('path');

var config = {
	"httpServer": {
		"host": process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
		"port": process.env.OPENSHIFT_NODEJS_PORT || 1337
	},
	"httpStatic": {
		"documentRoot": path.resolve(__dirname, "www")
	}
}

var app = server.run(config);