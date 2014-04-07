# Release Notes

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