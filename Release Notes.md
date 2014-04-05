# Release Notes 0.3

   * Changed config key for static HTTP server setup, see the example.
   * Added authentication via Passport.js, different authentication strategies may be used.
   * Added default routes and behavior to implement application login. 
   * Added default authentication middleware functions, see authenticate.js.
   * Added views, via consolidate any template engine can be used. 
   * Added a default error handler.
   * Added support for 404 behavior.
   * Added I18N: responses are filtered for L10N string occurrences.
   * Added logging: the server will now use a logger instance (with default log methods).

# Release Notes 0.2

   * Migrated from connect to express framework. 
   * Switched off the custom routing engine. 
