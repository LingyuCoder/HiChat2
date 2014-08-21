var koa = require('koa');
var serve = require('koa-static');
var less = require('koa-less2');
var openfire = require('koa-openfire');
var app = koa();

app.use(openfire({
	host: '127.0.0.1',
	port: 7070,
	path: '/http-bind/',
	method: 'POST',
	listen: '/JHB/'
}));

app.use(less({
  pattern: /\/src\/js\/(.+)\/(.+)\.css/,          //映射规则
  replacement: 'D://hichat2/src/js/$1/$2.less', //本地替换
  paths: ['D://hichat2/src/js']         //less的paths参数
}));

app.use(serve('.'));
app.listen(3000);