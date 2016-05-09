var express = require('express');
var router = express.Router();
var request = require('superagent');
var superagentPromisePlugin = require('superagent-promise-plugin');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var util = require('util');
var fs = require('fs');

superagentPromisePlugin.Promise = Promise;

var bare = '<!DOCTYPE html><html><head>%s<link href="/static/css/bootstrap.min.css" rel="stylesheet"><link href="/static/css/katex.min.css" rel="stylesheet"></head><body>%s</body><html>';
var legacyLib = '<script src="/static/js/archives/head.js"></script><link href="/static/css/style.css" rel="stylesheet" />';
var modernLib = '<link href="/static/css/econ-graphs-v2.css" rel="stylesheet"/>';
var edgeLib = '<link href="/static/css/capm-style.css" rel="stylesheet"/><script src="/static/js/archives/kg-head.js"></script><script src="/static/js/archives/capm-v3.js"></script>';
var legacy, edge;

router.get('/*', function(req, res, next) {
	legacy = false;
	edge = false;
	request.get('http://www.econgraphs.org' + req.url)
	.use(superagentPromisePlugin)
	.then(function (re) {
		var content = re.text;
		content = content.replace(/col-md-/g, 'col-xs-');
		_$ = cheerio.load(content);
		var body = _$('body').html();
		if (content.indexOf('econGraphsApp') !== -1) {
			legacy = true;
		}
		if (content.indexOf('MyApp')) {
			edge = true;
		}

		if (legacy) {
			body = util.format(bare, legacyLib, body);
		}else if (edge) {
			body = util.format(bare, edgeLib, body);
		}else{
			body = util.format(bare, modernLib, body);
		}

		$ = cheerio.load(body);
		$('div').filter(function() {
			return !!$(this).css('height');
		}).remove();
		$('body').find('nav').remove();

		if (legacy) {
			$('html').attr('ng-app', 'econGraphsApp');
			$('body').attr('ng-controller', 'Controller');
		}else if (edge) {
			$('html').attr('ng-app', 'myApp');
		}else{
			$('html').attr('ng-app', 'KineticGraphs');
		}

		res.send($.html());
	})
	.catch(function (err) {
		console.log(err);
	});
});

module.exports = router;
