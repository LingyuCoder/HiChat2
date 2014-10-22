define(function(require, exports, module) {
	var $ = require('jquery');
	var Event = require('event');

	var model = require('../mods/model');
	var alertify = require('alertify');
	var Peertc = require('peertc');

	require("./rtc.css");

	var peertc;

	var asking = {};
	var videoAsking = {};
	var gid = 0;

	function getGid() {
		return ++gid;
	}

	var $files = $('#J_files');
	var $fileList = $files.find('ul');
	$files.dialog({
		autoOpen: false,
		closeOnEscape: true,
		closeText: '关闭',
		draggable: true,
		resizable: true,
		width: 400,
		minHeight: 200,
		minWidth: 300,
		modal: false,
		title: '文件管理'
	});

	function drawFileMessage(data, uid, self) {
		$files.dialog('open');
		var $file;
		if (($file = $('#file_' + data.id)).length === 0) {
			$file = $('<li id="file_' + data.id + '" class="sending"></li>');
			$fileList.append($file);
		}
		if (self) {
			$file.html('发送文件' + data.meta.name + '给' + uid + ': <span class="result">' + (data.sended / data.sum * 100).toFixed(2) + '%</span>');
		} else {
			$file.html('接受来自' + uid + '的文件' + data.meta.name + ': <span class="result">' + (data.sended / data.sum * 100).toFixed(2) + '%</span>');
		}
		if (data.sended === data.sum) {
			$file.removeClass('sending').addClass('sended');
			$file.find('.result').html();
		}
	}

	var eventMapping = {
		message: 'rtc/message',
		fileAsk: 'rtc/file/ask',
		fileAskAccept: 'rtc/file/accept',
		fileAskReject: 'rtc/file/reject',
		videoAsk: 'rtc/video/ask',
		videoAskAccept: 'rtc/video/accept',
		videoAskReject: 'rtc/video/reject',
		dialogCheck: 'rtc/dialog/check',
		dialogOpen: 'rtc/dialog/open',
		dialogClose: 'rtc/dialog/close'
	};

	Event.on({
		'login/success': function(event) {
			peertc = Peertc('ws://localhost:2999', model.self.toSafeString());
			peertc.on('init', function() {
				console.log('inited');
			}).on('open', function(id) {
				$('#rtcPanel_' + id).show();
			}).on('close', function(id) {
				$('#rtcPanel_' + id).hide();
			}).on('message', function(data, from) {
				Event.trigger(eventMapping[data.type], [data.data, from]);
			}).on('fileChunkSended', function(data, to) {
				drawFileMessage(data, to, self);
			}).on('fileSended', function(meta, to) {
				alertify.success(meta.name + '发送成功');
			}).on('fileChunk', function(data, from) {
				drawFileMessage(data, from);
			}).on('file', function(meta, from) {
				alertify.success(meta.name + '接收成功');
			}).on('error', function(err) {
				alertify.error('发生错误');
			}).on('stream', function(stream, from) {
				Event.trigger('video/other/open', [stream, from]);
			}).on('localStream', function(stream) {
				Event.trigger('video/self/open', [stream]);
			}).on('removeStream', function(from) {
				Event.trigger('video/stop', [from]);
			});
		},
		'rtc/close': function(event, id) {
			Event.trigger('rtc/dialog/check', [id]);
		},
		'rtc/file/send': function(event, id, dom) {
			var file = dom && dom.files[0];
			if (file) {
				var gid = getGid();
				var fileObj = asking[gid] = {
					id: gid,
					file: file,
					dom: dom
				};
				peertc && peertc.connectors[id] && peertc.connectors[id].send({
					type: 'fileAsk',
					data: {
						id: fileObj.id,
						meta: {
							name: fileObj.file.name,
							size: fileObj.file.size,
							type: fileObj.file.type
						},
						from: model.self.nickname || model.self.toString()
					}
				});
			}

		},
		'rtc/connect': function(event, id) {
			peertc.connect(id);
		},
		'rtc/file/ask': function(event, data, from) {
			alertify.confirm(data.from + '向您发送文件 ' + data.meta.name + '(' + data.meta.size / 1000 + 'kb)，是否接收？', function(e) {
				var connector = peertc && peertc.connectors[from];
				if (e) {
					connector && connector.send({
						type: 'fileAskAccept',
						data: {
							id: data.id
						}

					});
				} else {
					connector && connector.send({
						type: 'fileAskReject',
						data: {
							id: data.id
						}
					});
				}
			});
		},
		'rtc/file/accept': function(event, data, from) {
			var fileObj = asking[data.id];
			peertc && peertc.connectors[from] && peertc.connectors[from].sendFile(fileObj.dom);
			alertify.success('开始发送' + fileObj.file.name);
			delete asking[data.id];
		},
		'rtc/file/reject': function(event, data, from) {
			var fileObj = asking[data.id];
			alertify.error('对方拒绝接收' + fileObj.file.name);
			delete asking[data.id];
		},
		'rtc/video/start': function(event, to) {
			peertc && peertc.connectors[to] && peertc.connectors[to].send({
				type: 'videoAsk',
				data: {
					id: getGid(),
					from: model.self.nickname || model.self.toString()
				}
			});
		},
		'rtc/video/stop': function(event, to) {
			var connector = peertc && peertc.connectors[to];
			if (connector.streaming) {
				connector.removeStream();
			}
		},
		'rtc/video/ask': function(event, data, from) {
			alertify.confirm(data.from + '请求与您视频聊天，是否接受？', function(e) {
				var connector = peertc && peertc.connectors[from];
				if (e) {
					connector && connector.send({
						type: 'videoAskAccept',
						data: {
							id: data.id
						}
					});
					var parse = from.split('_');
					var friends = model.friends;
					for (var i = friends.length; i--;) {
						if (friends[i].jid === parse[0] && friends[i].domain === parse[1]) {
							Event.trigger('chat/open', [friends[i]]);
							break;
						}
					}
				} else {
					connector && connector.send({
						type: 'videoAskReject',
						data: {
							id: data.id
						}
					});
				}
			});
		},
		'rtc/video/accept': function(event, data, from) {
			peertc && peertc.connectors[from] && peertc.connectors[from].addStream({
				video: true,
				audio: true
			});
		},
		'rtc/video/reject': function(event, data, from) {
			alertify.error('对方拒绝开启视频聊天');
		},
		'rtc/dialog/check': function(event) {
			peertc && peertc.connectors[to] && peertc.connectors[to].send({
				type: 'dialogCheck'
			});
		},
		'rtc/dialog/ask': function(event, data, from) {
			var connector = peertc && peertc.connectors[from];
			if ($('#J_chat_' + from).length) {
				connector.send({
					type: 'dialogOpen'
				});
			} else {
				connector.send({
					type: 'dialogClose'
				});
			}
		},
		'rtc/dialog/open': function() {
			//do nothing
		},
		'rtc/dialog/close': function() {
			peertc && peertc.connectors[from] && peertc.connectors[from].close();
		}
	});
});