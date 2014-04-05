/**
 * Authentication middleware functions. 
 * 
 */
module.exports.Authenticator = Authenticator;

function Authenticator () {}

Authenticator.forceLoginOnError = function (req, res, next) {
	//console.log('forceLoginOnError');
	if (req.isAuthenticated()) { 
		return next(); 
	} else {
		res.redirect('/login');	
	}
}

Authenticator.failOnError = function (req, res, next) {
	//console.log('failOnError', req.url);
	if (req.isAuthenticated()) { 
		return next();
	} else {
		res.status(401);
		res.end();
	}
}

Authenticator.allowAll = function (req, res, next) {
	//console.log('allowAll', req.url);
	return next();
}