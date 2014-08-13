var koa = require('koa');
var serve = require('koa-static');
var openfire = require('koa-openfire');
var app = koa();

app.use(openfire({
	host: '127.0.0.1',
	port: 7070,
	path: '/http-bind/',
	method: 'POST',
	listen: '/JHB/'
}));

app.use(serve('.'));
app.listen(3000);