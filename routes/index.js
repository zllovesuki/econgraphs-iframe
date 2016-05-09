var express = require('express');
var router = express.Router();
var request = require('superagent');
var superagentPromisePlugin = require('superagent-promise-plugin');
var cheerio = require('cheerio');
var fs = require('fs');
var Promise = require('bluebird');
var util = require('util');

superagentPromisePlugin.Promise = Promise;

var bare = '<!DOCTYPE html><head><link href="/static/css/bootstrap.min.css" rel="stylesheet"><link href="/static/css/katex.min.css" rel="stylesheet"><link href="/static/css/econ-graphs-v2.css" rel="stylesheet"/></head><body>%s</body>';

router.get('/*', function(req, res, next) {
	request.get('http://www.econgraphs.org' + req.url)
	.use(superagentPromisePlugin)
	.then(function (re) {
		var content = re.text;
		_$ = cheerio.load(content);
		var body = _$('body').html();
		body = util.format(bare, body);
		$ = cheerio.load(body);
		$('div').filter(function() {
			return !!$(this).css('height');
		}).remove();
		$('body').find('nav').remove();
		$('body').attr('ng-app', 'KineticGraphs');
		res.send($.html());
	})
	.catch(function (err) {
		console.log(err);
	});
});

module.exports = router;
