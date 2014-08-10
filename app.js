var koa = require('koa');
var router = require('koa-router');
var serve = require('koa-static');
var bodyParse = require('koa-body-parser');
var http = require('http');
var app = koa();

var raw = require('raw-body');

var xml2js = require('xml2js');


var parser = new xml2js.Parser();

function getBody(req) {
	req = req.req || req;
	var type = (req.headers['content-type'] || '').split(';')[0];
	if (type.indexOf('text/xml') !== -1 || type.indexOf('application/xml') !== -1) {
		return function(done) {
			raw(req, function(err, str) {
				if (err) return done(err);
				try {
					done(null, str.toString());
				} catch (err) {
					err.status = 400;
					err.body = str;
					done(err);
				}
			});
		};
	} else {
		return function(done) {
			var err = new Error('Unsupported or missing content-type');
			err.status = 415;
			done(err);
		};
	}
}

app.use(bodyParse());
app.use(router(app));

var boshOpts = {
	host: '127.0.0.1',
	port: 7070,
	path: '/http-bind/',
	method: 'POST'
};

function boshRequest(ret) {
	var cache = "";
	return function(done) {
		var boshReq = http.request(boshOpts, function(boshRes) {
			boshRes.on('data', function(data) {
				console.log('xmpp response:' + data.toString());
				data = data.toString();
				parser.parseString(data, function(err, result) {
					if (err) {
						cache += data;
					} else {
						cache += data;
						done(null, cache);
					}
				});
			});
		});

		console.log('xmpp request: ' + ret);
		boshReq.end(ret);
	};
}

app.use(function * (next) {
	var self = this;
	if (self.path === '/JHB/') {
		var ret = yield getBody(this);
		this.body = yield boshRequest(ret);
		this.type = "text/xml";
		this.charset = "utf-8";
		yield next;
	} else {
		yield next;
	}
});

app.use(serve('.'));

app.listen(3000);