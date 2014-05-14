var cheerio = require('cheerio');
var fs = require('fs');

var docPath = process.argv[2];

function loadDocument (path) {
	return fs.readFileSync(path).toString();
}

function parseDocument (path) {
	var doc = {
		title: null
		,controller: {
			code: null
			,src: null
		}
		,css: []
		,dependencies: []
	};
	var view = loadDocument(path);
	var $ = cheerio.load(view);

	// Get title
	var title = $('title');
	if (title.length) {
		console.log('Found title.');
		doc.title = title.text()
	}

	// Get view controller. 
	var viewControllerScript = $('script[id=viewController]');
	if (viewControllerScript.length) {
		if (viewControllerScript.attr('src')) {
			console.log('Found external view controller.');
			doc.controller.src = viewControllerScript.attr('src');
		} else {
			console.log('Found inline view controller. Inline view controllers should not be used in production!');
			doc.controller.code = viewControllerScript.text();
			// [TBD] Should go crazy here with some Esprima-based Javascript parsing
			// to check for the presence of 'define([], function () {});'
		}
	} else {
		console.log('View controller not found.');
	}

	// Get CSS files. 
	var cssLinks = $('link[rel=stylesheet]');
	if (cssLinks.length) {
		console.log('Found CSS links.');
		cssLinks.each(function (idx, link) {
			doc.css.push($(this).attr('href'));
		});
	} else {
		console.log('No CSS links found.');
	}

	console.log(require('sys').inspect(doc));
}

parseDocument(docPath);