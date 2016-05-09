var express = require('express');
var router = express.Router();
var proxy = require('express-http-proxy');

router.get('/*', proxy('www.econgraphs.org', {
	forwardPath: function(req, res) {
		return '/static' + require('url').parse(req.url).path;
	}
}));

module.exports = router;
