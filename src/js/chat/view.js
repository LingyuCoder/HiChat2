define(function(require, exports, module) {
	var Event = require('event');
	var $ = require('jquery');
	var RESOURCE = require('resource');
	var timeformat = require('timeformat');
	var alertify = require('alertify');
	var Peertc = require('peertc');
	var peertc;
	var localStream;
	var model = require('../mods/model');
	var Message = require('../mods/message');
	var mapId = 0;

	require('./connect');
	require('./chat.css');

	var $chat = $('<div class="g_chat_dlg">' + '<div class="g_chat_info">' + '<img class="u_avatar" src="' + RESOURCE.DEFAULT_AVATAR + '"/>' + '<div class="u_status"></div>' + '<div class="u_nick"></div>' + '</div>' + '<textarea class="u_msg_ipt"></textarea></div>');
	var $msgTpl = $('<div class="clearfix g_line"><span class="u_msg"></span></div>');

	function initChatDialog(detail) {
		if ($('#J_chat_' + detail.jid + '_' + detail.domain).length > 0) {
			return;
		}
		var $dlg = $chat.clone();
		var $textarea = $dlg.find('.u_msg_ipt');
		var timeout;
		$dlg.dialog({
			autoOpen: true,
			closeOnEscape: true,
			closeText: '关闭',
			draggable: true,
			resizable: true,
			width: 600,
			height: 400,
			minHeight: 200,
			minWidth: 300,
			modal: false,
			buttons: [{
				text: '发送',
				click: function() {
					var content = $.trim($textarea.val());
					if (content) {
						var message = new Message(content, model.get('self').toString(), detail.toString(), new Date());
						Event.trigger('connect/message/send', [message]);
						drawMessage(message);
						$textarea.val('');
					}
				}
			}, {
				text: '关闭',
				click: function() {
					$dlg.dialog('widget').find('video').each(function() {
						this.pause();
					});
					$dlg.dialog('destroy');
					Event.trigger('rtc/video/stop', [detail.toSafeString()]);
					Event.trigger('rtc/video/close', [detail.toSafeString()]);
				}
			}],
			create: function(event, ui) {
				var $widget = $dlg.dialog('widget');
				var $info = $widget.find('.g_chat_info');
				if (detail.hasAvatar()) {
					$info.find('.u_avatar').attr('src', detail.avatar.toString());
				}
				$textarea.attr('id', 'J_msg_' + detail.jid + '_' + detail.domain);
				$info.find('.u_nick').text(detail.personalInfo.nickname || detail.toString());
				$widget.find('.ui-dialog-titlebar').html($info);
				$widget.find('.ui-dialog-buttonpane').prepend($textarea);

				$widget.find('.ui-dialog-buttonpane').append('<div id="rtcPanel_' + detail.toSafeString() + '"><input type="file" style="display: none" class="u_fileIpt" id="u_sendFileBtn_' + detail.toSafeString() + '"><label class="iconfont u_chat_helper u_sendFile_btn" for="u_sendFileBtn_' + detail.toSafeString() + '">&#xe604;</label><span class="iconfont u_chat_helper u_video_btn">&#xe606;</span><input type="file" style="display: none" class="u_imageIpt" id="u_sendImageBtn_' + detail.toSafeString() + '"><label class="iconfont u_chat_helper u_sendImage_btn" for="u_sendImageBtn_' + detail.toSafeString() + '">&#xe608;</label><span class="iconfont u_chat_helper u_location_btn">&#xe609;</span></div>');

				$widget.find('.u_fileIpt').change(function() {
					Event.trigger('rtc/file/send', [detail.toSafeString(), this]);
				});
				$widget.find('.u_location_btn').click(function() {
					if (navigator.geolocation) {

						navigator.geolocation.getCurrentPosition(getSuccess, getError, {
							enableHighAccuracy: true,
							timeout: 5000,
							maximumAge: 0
						});

						function getSuccess(position) {
							var message = new Message({
								"type": "location",
								"latitude": position.coords.latitude,
								"longitude": position.coords.longitude
							}, model.get('self').toString(), detail.toString(), new Date());
							Event.trigger('connect/message/send', [message]);
							drawMessage(message);
						}

						function getError(error) {
							switch (error.code) {
								case error.TIMEOUT:
									console.log('超时');
									break;
								case error.PERMISSION_DENIED:
									console.log('用户拒绝提供地理位置');
									break;
								case error.POSITION_UNAVAILABLE:
									console.log('地理位置不可用');
									break;
								default:
									break;
							}
						}
					}
				});
				$widget.find('.u_imageIpt').change(function() {
					var that = this;
					var file = that.files[0];
					if (file) {
						var reader = new window.FileReader(file);
						reader.readAsDataURL(file);
						reader.onload = function(event, text) {
							var message = new Message({
								"type": "image",
								"content": event.target.result
							}, model.get('self').toString(), detail.toString(), new Date());
							Event.trigger('connect/message/send', [message]);
							drawMessage(message);
						};
					}

				});
				$widget.find('.u_video_btn').click(function() {
					var $this = $(this);
					if (!$this.hasClass('on')) {
						Event.trigger('rtc/video/start', [detail.toSafeString()]);
					} else {
						Event.trigger('rtc/video/stop', [detail.toSafeString()]);
					}

				});
				Event.trigger('rtc/connect', [detail.toSafeString()]);
			}
		});
		$dlg.attr('id', 'J_chat_' + detail.jid + '_' + detail.domain);
		if (model && model.history && (unreadMessage = model.history[detail.toString()])) {
			$.each(unreadMessage, function(index, message) {
				drawMessage(message);
			});
			delete model.history[detail.toString()];
			Event.trigger('friend/message/remind', [detail.toUser(), 0]);
		}
	}

	function changeChatStatus(status) {
		var user = status.from;
		var type = status.type;
		var $dlg = $('#J_chat_' + user.jid + '_' + user.domain);
		if ($dlg) {
			var $status = $($dlg.dialog('widget')).find('.u_status');
			var statusMap = {
				'composing': '正在输入...',
				'active': '',
				'inactive': ''
			};
			if (type) {
				$status.text(statusMap[type]);
			} else {
				$status.text('');
			}
		}
	}

	function drawMessage(message) {
		var from = message.from;
		var to = message.to;
		var $dlg;
		var self = from.toString() === model.self.toString();
		$dlg = self ? $('#J_chat_' + to.jid + '_' + to.domain) : $('#J_chat_' + from.jid + '_' + from.domain);
		if ($dlg.length > 0) {
			var $message = $msgTpl.clone();
			var $ctn = $message.find('span');
			if (message.message.type === 'image') {
				$ctn.html('<p>' + timeformat(message.time, 'hh:mm:ss') + '：' + '</p>' + '<img width=300 src="' + message.message.content + '"/>');
				$dlg.append($message);
			} else if (message.message.type === 'location') {
				console.log(message.message);
				$ctn.html('<p>' + timeformat(message.time, 'hh:mm:ss') + '：' + '</p>' + '<p><div class="u_msg_loc" id="baidu_map_' + mapId + '"></div></p>');
				$dlg.append($message);
				var map = new BMap.Map('baidu_map_' + mapId);
				var point = new BMap.Point(message.message.longitude, message.message.latitude);
				map.centerAndZoom(point, 13);
				map.centerAndZoom(point, 17);
				map.addOverlay(new BMap.Marker(point));
				mapId++;
			} else {
				$ctn.html('<p>' + timeformat(message.time, 'hh:mm:ss') + '：' + '</p>' + '<p>' + message.message + '</p>');
				$dlg.append($message);
			}

			$ctn.addClass('u_msg').addClass(self ? 'u_self' : 'u_other');
			var dlg = $dlg.get()[0];
			dlg.scrollTop = dlg.scrollHeight;
		} else {
			var fromJid = from.toString();
			var history = (model.history = model.history || {});
			history[fromJid] = history[fromJid] || [];
			history[fromJid].push(message);
			Event.trigger('friend/message/remind', [from, history[fromJid].length]);
		}
	}

	Event.on({
		"chat/open": function(event, detail) {
			initChatDialog(detail);
		},
		"message/receive": function(event, message) {
			drawMessage(message);
		},
		"message/status": function(event, status) {
			changeChatStatus(status);
		},
		"video/other/open": function(event, stream, from) {
			var $dlg = $('#J_chat_' + from);
			var $widget = $dlg.dialog('widget');
			$widget.find('.u_video_btn').addClass('on');
			var $otherVideo = $('<video class="video other"></video>');
			var $selfVideo = $('<video class="video self"></video>');

			$otherVideo.get()[0].onpause = function() {
				this.play();
			};

			$selfVideo.get()[0].onpause = function() {
				this.play();
			};

			$widget.append($otherVideo).append($selfVideo);
			stream.attachTo($otherVideo.get()[0]);
			if (localStream) {
				localStream.attachTo($selfVideo.get()[0]);
			}
		},
		"video/self/open": function(event, stream, from) {
			localStream = stream;
			$('.video.self').each(function() {
				stream.attachTo(this);
			});
		},
		"video/stop": function(event, from) {
			var $widget = $('#J_chat_' + from).dialog("widget");
			var $video = $widget.find('.video');
			$widget.find('.u_video_btn').removeClass('on');
			$video.remove();
		}
	});
});