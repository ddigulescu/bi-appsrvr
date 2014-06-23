# BI Web Application Server

This is the web application server used for web projects at Bisnode Informatics. It is basically a "sugar and best-practice module", that enables developers to get a typical system with minimal effort. bi-appsrvr can easily be run on any host with node.js support, as it has no additional system requirements.

bi-appsrvr includes:

   * an HTTP server
   * an HTTPS server
   * a Websocket server
   * a simple routing engine
   * application modules that can be hooked into routes
   * cookie support
   * session support
   * a query and request body parser
   * CSRF (cross-site request forgery) protection
   * an authentication module
   * Websocket support. 

All of these features can be enabled independently from each other and are easily configurable. The bi-appsrvr ensures that middleware is added in the right order. 

The bi-appsrvr is based on the excellent [Express web application framework](http://expressjs.com/).

## Bundled Middleware / Features

The bi-appsrvr comes with a set of bundled Express middleware. Configuration options for individual middleware modules are simply
passed through from your application server configuration. Please see the individual middleware module documentation on how to configure 
them. This section lists all included middleware. 

### Request Parameter Parser

Request parameter parsing is handled by Express middleware. Query parameters are available in the `params` property of the `request` argument. 

### Request Body Parser

Request bodies of POST and PUT methods are parsed with the [body-parser middleware](https://github.com/expressjs/body-parser). 
It supports JSON, binary, text and urlencoded bodies. File uploads are not handled by this middleware! Request body data is available
in the `body` parameter of the `request` argument. 

### File Upload Handling

For file uploads using POST and PUT, [connect-busboy](https://github.com/mscdex/connect-busboy), which is based on [busboy](https://github.com/mscdex/busboy), is used.

### Request Logging

HTTP[S] request logging uses the [Morgan middleware](https://github.com/expressjs/morgan). 

### Error Handling

For handling internal server errors, the Express [errorhandler middleware](https://github.com/expressjs/errorhandler) is used. It is only active in development mode and sends a stack trace document to the browser. For production mode, a 500.html may be created in the document root folder, to which a client will be redirected in case of an interval server error. The errorhandler middleware is always at the end of the route stack, which is required for it to work correctly. You can define your own error handler middleware. If a URL can not be resolved, a 404.html page may be defined in the document root folder, to which a client will be redirected. 

## Usage

To use the bi-appsrvr, install it as a project dependency, just like Express. Express itself is not required as your project's dependency. To bootstrap your own project use e.g.:  

    mkdir your_project_folder
    cd your_project_folder
    npm init
    npm install --save bi-appsrvr

npm's `--save` argument automatically adds the bi-appsrvr dependency to your package.json.

Then create your main server script, e.g.:

    var biappsrvr = require('bi-appsrvr');
    var server = biappsrvr.Server();
    var config = {
        // ...your server configuration
    };
    var app = server.configure(config);
    // ... add your own routes
    
    server.start(function () {
        // The optional callback function is called when the server was successfully started. 
    });

In the above example, `app` is the Express server instance, that you can use just like any other Express application. Please note that you should start the server after you've added your application's routes. Please see the next section for configuration options and the `/example` folder for working examples.

After you've created your server, simply start it with: 

    node yourServer.js

## Server Configuration

This section lists all available configuration options.

<table>
   <tr>
      <td>authentication</td>
      <td></td>
   </tr>
   <tr>
      <td>cookieSession</td>
      <td><a href="https://github.com/expressjs/cookie-session">cookie-session</a> middleware configuration.</td>
   </tr>
   <tr>
      <td>documentRoot</td>
      <td>The root folder of static HTTP[S] resource files.</td>
   </tr>
   <tr>
      <td>httpServer</td>
      <td>Configuration of the HTTP server via <code>host</code> and <code>port</code> keys. Both <code>httpServer</code> and <code>httpsServer</code> may be omitted static servers, a server will then be created at 127.0.0.1:8080.</td>
   </tr>
   <tr>
      <td>httpsServer</td>
      <td>Configuration of the HTTPS server via <code>host</code> and <code>port</code> keys and an additional <code>ssl</code> object, that is passed through to the <a href="http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener">HTTPS.createServer</a> call.</td>
   </tr>
   <tr>
      <td>requestLog</td>
      <td><a href="https://github.com/expressjs/morgan">Morgan middleware</a> middleware configuration.</td>
   </tr>
   <tr>
      <td>runMode</td>
      <td>Sets the run mode of the server, may be <code>prod</code>, <code>test</code> or <code>dev</code> (default mode, if not set). The error handler middleware for displaying the stacktrace is only used when the server runs in development mode.</td>
   </tr>
   <tr>
      <td>views</td>
      <td></td>
   </tr>
   <tr>
      <td>websockets</td>
      <td><a href="http://socket.io/">socket.io</a> configuration.</td>
   </tr>
</table>

## Application Configuration

When writing your own applications, you'll most often need configuration values that are dependent of your environment, for instance, you'll use different a database or service endpoints in your test, QA or production environments. *DO NOT* define such values in your script, instead use a separate configuration file for each environment.

bi-appsrvr comes with the (yargs)[https://github.com/chevex/yargs] command line parser, that you can access like this: 

    var args = biappsrvr.commandlineArguments();
    var mode = args.mode;
    var configfile = args.config;

In your server configuration, use the values from your config files. 

Also you *SHOULD NOT* store your configuration file inside the project source folder. Use a separate repository instead. 

## Unit Test

To run the tests, [Mocha](http://visionmedia.github.io/mocha/) must be installed. Then simply run `make test` or `mocha` in the project root folder. The HTTP assertions of the tests are implemented with [SuperTest](https://github.com/visionmedia/supertest).

