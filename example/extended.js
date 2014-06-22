/**
 * Example with static HTTP server, Openshift support, form parsing with file upload.
 */

"use strict";

// Please note: require('../server.js') is only valid from within the example folder.
// When using the bi-appsrvr module in your own project, use require('bi-appsrvr').
var biappsrvr	= require('../server.js');
var path 		= require('path');

// Extended server configuration. Using the Openshift environment variables is everything required
// to allow this server to run on the Openshift PaaS. 
var config = {
	'httpServer': {
		'host': process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
		'port': process.env.OPENSHIFT_NODEJS_PORT || 1337
	},
	'documentRoot': path.resolve(__dirname, 'www')
}

var server = biappsrvr.Server();
var app = server.configure(config);
server.start();

// Form parsing including file upload handling is done using the busboy middleware,
// see https://github.com/mscdex/connect-busboy.
app.post('/upload.html', function (req, res, next) {
	var response = [];
	req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      	response.push('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      	file.on('data', function(data) {
        	response.push('File [' + fieldname + '] got ' + data.length + ' bytes');
      	});
      	file.on('end', function() {
        	response.push('File [' + fieldname + '] Finished');
      	});
    });

    req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      	response.push('Field [' + fieldname + ']: value: ' + val);
    });

    req.busboy.on('finish', function() {
    	// Write a dynamic response:
    	res.end(response.join('<br>'));

    	// Or send a Location header:
      	//res.writeHead(303, { Connection: 'close', Location: '/file-upload-success.html' });
      	//res.end();
    });

    req.pipe(req.busboy);
});