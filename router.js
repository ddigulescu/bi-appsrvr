/**
 * Routing middleware for Connect.
 *
 */

"use strict";

module.exports.router = function () {
	return new Router();
}

function Router () {
	this.routes = [];
}

Router.prototype = {
	handler: function (req, res, next) {
		var route = this.match(req.url, req.method);
		if (route) {
			req.route = route;
			route.handler(req, res, next);
		} else {
			next();
		}
	},
	match: function (url, method) {
		var match;
		for (var i = 0; i < this.routes.length; i++) {
			var rd = this.routes[i];

			if (rd.method !== method) {
				continue;
			}

			var regexp = new RegExp(rd.regexp);			
			var match = url.match(regexp);
			if (match) {
				var params = {}
				var ps = match.slice(1);
				ps.forEach(function (item, idx) {
					params[rd.params[idx]] = item;
				});
				return {
					path: rd.path
					,params: params
					,handler: rd.handler
					,remaining: url.substring(rd.path.indexOf('*'))
				}
			}
		}
	},

	/**
	 * @param {string} path
	 * @param {string} [method]
	 * @param {function} handler
	 */
	addRoute: function () {
		var path = arguments[0];
		var method = (typeof arguments[1] === 'string') ? arguments[1] : 'GET';
		var handler = arguments[arguments.length - 1];

		var parsed = makeRouteRegExp(path);
		this.routes.push({ 
			regexp: parsed.regexp
			,params: parsed.params
			,path: path
			,method: method.toUpperCase()
			,handler: handler
			,specificity: getSpecificity(path) });
		this.routes = this.routes.sort(function (a, b) { return a.specificity < b.specificity ? 1 : a.specificity > b.specificity ? -1 : 0  });

		function makeRouteRegExp (path) {
			var i = 0, params = [];
			path = path.replace(/\:\w+/g, function (s) {
				params.push(s.split(':')[1]);
				return "([^\/]+)";
			});
			path = '^' + path.replace(/\*/g, '.*') + '$';
			return { regexp: new RegExp(path), params: params };
		}

		function getSpecificity (path) {
			var specificity = 0;
			path.split('/').forEach(function (path) {
				specificity += 2;
				if (path.indexOf('*') == -1) {
					specificity += 1
				}
			});
			return specificity;
		}
	},
	removeRoute: function (url) {

	}
}