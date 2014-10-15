define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");

	var model = require("../mods/model");
	var alertify = require('alertify');
	var rtc = SkyRTC();

	Event.on({
		"login/success": function(event) {
			// rtc.on("send_file_accepted", function(sendId, socketId, file) {
			// 	alertify.success('对方接收" + file.name + "文件，等待发送');
			// });
			// //对方拒绝接收文件
			// rtc.on("send_file_refused", function(sendId, socketId, file) {
			// 	alertify.error("对方拒绝接收" + file.name + "文件");
			// });
			// //请求发送文件
			// rtc.on('send_file', function(sendId, socketId, file) {
			// 	alertify.log("请求发送" + file.name + "文件");
			// });
			// //文件发送成功
			// rtc.on('sended_file', function(sendId, socketId, file) {
			// 	alertify.success(file.name + "发送成功！", "", 0);
			// });
			// //发送文件碎片
			// rtc.on('send_file_chunk', function(sendId, socketId, percent, file) {
			// 	console.log(file.name + "文件正在发送: " + Math.ceil(percent) + "%");
			// });
			// //接受文件碎片
			// rtc.on('receive_file_chunk', function(sendId, socketId, fileName, percent) {
			// 	console.log("正在接收" + fileName + "文件：" + Math.ceil(percent) + "%");
			// });
			// //接收到文件
			// rtc.on('receive_file', function(sendId, socketId, name) {
			// 	alertify.success(name + "接收成功！", "", 0);
			// });
			// //发送文件时出现错误
			// rtc.on('send_file_error', function(error) {
			// 	alertify.error(error.message);
			// });
			// //接收文件时出现错误
			// rtc.on('receive_file_error', function(error) {
			// 	alertify.error(error.message);
			// });
			// //接受到文件发送请求
			// rtc.on('receive_file_ask', function(sendId, socketId, fileName, fileSize) {
			// 	var p;
			// 	alertify.confirm(rtc.getUid(socketId) + "用户想要给你传送" + fileName + "文件，大小" + fileSize + "KB,是否接受？", function(e) {
			// 		if (e) {
			// 			rtc.sendFileAccept(sendId);
			// 			alertify.log("准备接收" + fileName + "文件");
			// 		} else {
			// 			rtc.sendFileRefuse(sendId);
			// 		}
			// 	})
			// });
			// //成功创建WebSocket连接
			// rtc.on("connected", function(socket) {
			// 	//创建本地视频流
			// 	rtc.createStream({
			// 		"video": true,
			// 		"audio": true
			// 	});
			// });
			// //创建本地视频流成功
			// rtc.on("stream_created", function(stream) {
			// 	// var $me = $dlg.find('.me');
			// 	// if($me.length === 0) {
			// 	// 	$me = $('<video class="me" autoplay></video>');
			// 	// 	$dlg.append($me);
			// 	// }
			// 	// $me.attr('src', URL.createObjectURL(stream));
			// 	// $me.get()[0].play();
			// });
			// //创建本地视频流失败
			// rtc.on("stream_create_error", function() {
			// 	alertify.error("创建本地视频流失败");
			// });
			// //接收到其他用户的视频流
			// rtc.on('pc_add_stream', function(stream, socketId) {
			// 	//var id = "other-" + socketId,
			// 	//newVideo = $('<video id="' + id + '" class="other" autoplay="autoplay"></video>');
			// 	//$dlg.append(newVideo);
			// 	//rtc.attachStream(stream, id);
			// });
			// //删除其他用户
			// rtc.on('remove_peer', function(socketId) {
			// 	var video = document.getElementById('other-' + socketId);
			// 	if (video) {
			// 		video.parentNode.removeChild(video);
			// 	}
			// });
			// rtc.connect("ws://localhost:2999/app/index.html", '__fileSender', model.self.toString());
		},
		"rtc/sendFile": function(event, dom, user) {
			//rtc.sendFile(dom, rtc.getSocketId(user.toString()));
		}
	});
});