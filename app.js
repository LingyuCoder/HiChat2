var koa = require('koa');
var router = require('koa-router');
var serve = require('koa-static');
var bodyParse = require('koa-body-parser');
var http = require('http');
var app = koa();

var raw = require('raw-body');

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
	return function(done) {
		var fb_req = http.request(boshOpts, function(fb_res) {
			fb_res.on('data', function(fb_data) {
				console.log('xmpp response: ' + fb_data.toString());
				done(null, fb_data.toString());
			});
		});

		console.log('xmpp request: ' + ret);
		fb_req.end(ret);
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