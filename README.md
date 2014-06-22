# BI Web Application Server

## What? 

This is the web application server used for web projects at Bisnode Informatics. It is basically a "sugar and best-practice module", that enables developers to get a typical system with only a few keystrokes, and that can be easily be used either on a local development machine or deployed to QA or production systems.

## Contents 

The bi-appsrvr includes:

   * an HTTP server
   * an HTTPS server
   * a Websocket server
   * a simple routing engine
   * application modules that can be hooked into routes

All of these features can be enabled independently from each other and are easily configurable. 

The bi-appsrvr is based on the excellent Express web application framework and comes with:

   * cookie support
   * session support
   * a query and request body parser
   * CSRF (cross-site request forgery) protection
   * an authentication module
   * Websocket support. 

## Bundled Middleware

The bi-appsrvr comes with a set of bundled Express middleware. Configuration options for individual middleware modules are simply
passed through from your application server configuration. Please see the individual middleware module documentation on how to configure 
them. This section lists all included middleware. 

### Request Body Parser

Request bodies of POST and PUT methods are parsed with the [body-parser middleware](https://github.com/expressjs/body-parser). 
It supports JSON, binary, text and urlencoded bodies. File uploads are not handled by this middleware! 

### File Upload Handling

For file uploads using POST and PUT, [connect-busboy](https://github.com/mscdex/connect-busboy), which is based on [busboy](https://github.com/mscdex/busboy), is used.

### Request Logging

HTTP[S] request logging uses the [Morgan middleware](https://github.com/expressjs/morgan). 

### Error Handling

For handling internal server errors, the Express [errorhandler middleware](https://github.com/expressjs/errorhandler) is used. It is only active in development mode and sends a stack trace document to the browser. For production mode, a 500.html may be created in the document root folder, to which a client will be redirected in case of an interval server error. The errorhandler middleware is always at the end of the route stack, which is required for it to work correctly. You can define your own error handler middleware. If a URL can not be resolved, a 404.html page may be defined in the document root folder, to which a client will be redirected. 

## Configuration

<table>
   <tr>
      <td>authentication</td>
      <td></td>
   </tr>
   <tr>
      <td>cookieSession</td>
      <td>[cookie-session](https://github.com/expressjs/cookie-session) middleware configuration.</td>
   </tr>
   <tr>
      <td>documentRoot</td>
      <td>The root folder of static HTTP[S] resource files.</td>
   </tr>
   <tr>
      <td>httpServer</td>
      <td>Configuration of the HTTP server via `host` and `port` keys.</td>
   </tr>
   <tr>
      <td>httpsServer</td>
      <td>Configuration of the HTTPS server via `host` and `port` keys and an additional `ssl` object, that is passed through to the (HTTPS.createServer)[http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener] call.</td>
   </tr>
   <tr>
      <td>requestLog</td>
      <td>[Morgan middleware](https://github.com/expressjs/morgan) middleware configuration.</td>
   </tr>
   <tr>
      <td>runMode</td>
      <td>Sets the run mode of the server, may be `production` or `development`. The error handler middleware for displaying the stacktrace is only used when the server runs in development mode.</td>
   </tr>
   <tr>
      <td>views</td>
      <td></td>
   </tr>
   <tr>
      <td>websockets</td>
      <td>[socket.io](http://socket.io/) configuration.</td>
   </tr>
</table>


## Usage

To use the bi-appsrvr, install it as a project dependency, just like Express. Please see the examples for more information. 


## Unit Test

To run the tests, [Mocha](http://visionmedia.github.io/mocha/) must be installed. Then simply run `make test` or `mocha` in the project root folder. The HTTP assertions of the tests are implemented with [SuperTest](https://github.com/visionmedia/supertest).

