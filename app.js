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


/******peertc server******/
var express = require('express');
var path = require("path");
var app = express();
var server = require('http').createServer(app);
require('peertc').listen(server);

server.listen(2999);

/******skyrct server******/
var groupapp = express();
var groupserver = require('http').createServer(groupapp);
var skyrtc = require('skyrtc').listen(groupserver);
groupserver.listen(2998);

skyrtc.rtc.on('new_connect', function(socket) {
	console.log('创建新连接');
});

skyrtc.rtc.on('remove_peer', function(socketId) {
	console.log(socketId + "用户离开");
});

skyrtc.rtc.on('new_peer', function(socket, room) {
	console.log("新用户" + socket.id + "加入房间" + room);
});

skyrtc.rtc.on('socket_message', function(socket, msg) {
	console.log("接收到来自" + socket.id + "的新消息：" + msg);
});

skyrtc.rtc.on('ice_candidate', function(socket, ice_candidate) {
	console.log("接收到来自" + socket.id + "的ICE Candidate");
});

skyrtc.rtc.on('offer', function(socket, offer) {
	console.log("接收到来自" + socket.id + "的Offer");
});

skyrtc.rtc.on('answer', function(socket, answer) {
	console.log("接收到来自" + socket.id + "的Answer");
});

skyrtc.rtc.on('error', function(error) {
	console.log("发生错误：" + error.message);
});