module.exports = (function () {
	var routes = [];

	return {
		addRoute: addRoute,
		router: router,
		findRoute: findRoute
	}

	function router (req, res, next) {
		var route = findRoute(req.url);
		if (route) {
			console.log(req.url, route);
			req.route = route;
		}
		next();
	}

	function findRoute (url) {
		var match;
		for (var i = 0; i < routes.length; i++) {
			
			var rd = routes[i];
			var regexp = new RegExp(rd.regexp);
			
			var match = url.match(regexp);
			if (match) {
				var params = {}
				var ps = match.slice(1);
				ps.forEach(function (item, idx) {
					params[rd.params[idx]] = item;
				});
				console.log(url, params)
				return {
					path: rd.path,
					params: params
				}
			}
		}
	}

	function addRoute (path, handler) {
		var parsed = makeRouteRegExp(path);
		routes.push({ regexp: parsed.regexp, params: parsed.params, path: path, handler: handler, specificity: getSpecificity(path) });
		routes = routes.sort(function (a, b) { return a.specificity < b.specificity ? 1 : a.specificity > b.specificity ? -1 : 0  });

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
			var pathCmpnts = path.split('/');
			var specificity = 0;
			pathCmpnts.forEach(function (path) {
				specificity += 2;
				if (path.indexOf('*') == -1) {
					specificity += 1
				}
			});
			return specificity;
		}
	}

	function removeRoute () {}
})();