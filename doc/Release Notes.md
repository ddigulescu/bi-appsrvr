# Release Notes

## 0.3.0

   * Upgraded to Express version 4.4.3.
   * Upgraded to socket.io version 1.0.6.
   * Changed the server API: configuring and starting the server is now separated, stopping the server 
     was added. Please see the the examples servers.
   * For static servers, no explicit HTTP[S] server configuration is required anymore. An HTTP 
     server will be started with 127.0.0.1:8080.
   * The 'httpStatic' configuration object was removed, its property 'documentRoot' moved top-level.
   * Improved server error handling: for development mode, the errorhandler middleware displays the 
     the stack trace, for production mode, the client is redirected to /500.html, if it exists.
   * Improved handling if page is not found: the client is redirected to /404.html, if it exists.
   * Added Mocha tests.
   * Updated and improved the project readme.
   * Added Morgan request log middleware.
   * socket.io upgraded to version 1.0.6.
   * The configuaration key 'session' was renamed to 'cookieSession'.

## 0.2.3

   * Added configuration checks: the server gives a message, then exits on missing keys.

## 0.2.2

   * User-defined routes are registered in a dedicated app and evaluated before the static server 
     middleware, authentication can now be used for static servers.
   * Changed login handler to POST method.

## 0.2.1

   * Added a default error handler.
   * Added support for 404 behavior.
   * Changed config key for static HTTP server setup, see the example.
   * Added views, via consolidate any template engine can be used. 

## 0.2

   * Migrated from connect to express framework. 
   * Switched off the custom routing engine. 
   * Added authentication via Passport.js, different authentication strategies may be used.
   * Added default routes and behavior to implement application login. 
   * Added default authentication middleware functions, see authenticate.js.
