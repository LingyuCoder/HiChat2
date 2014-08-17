define(function(require, exports, module) {
	var Event = require("event");
	var $ = require("jquery");
	var RESOURCE = require("resource");
	var model = require("mods/model");
	var Message = require("mods/message");
	require("connect/chat");
	var timeformat = require("widgets/timeformat");
	var $chat = $('<div class="g_chat_dlg">' + '<div class="g_chat_info">' + '<img class="u_avatar" src="' + RESOURCE.DEFAULT_AVATAR + '"/>' + '<div class="u_status"></div>' + '<div class="u_nick"></div>' + '</div>' + '<textarea class="u_msg_ipt"></textarea>' + '</div>');
	var $msgTpl = $('<div class="clearfix g_line"><span class="u_msg"></span></div>');

	function initChatDialog(detail) {
		if ($("#J_chat_" + detail.jid + "_" + detail.domain).length > 0) {
			return;
		}
		var $dlg = $chat.clone();
		var $textarea = $dlg.find(".u_msg_ipt");
		$dlg.dialog({
			autoOpen: true,
			closeOnEscape: true,
			closeText: "关闭",
			draggable: true,
			resizable: true,
			width: 600,
			height: 400,
			minHeight: 200,
			minWidth: 300,
			modal: false,
			buttons: [{
				text: "发送",
				click: function() {
					var content = $.trim($textarea.val());
					if (content) {
						var message = new Message(content, model.get("self").toString(), detail.toString(), new Date());
						Event.trigger("connect/message/send", [message]);
						drawMessage(message);
						$textarea.val("");
					}
				}
			}, {
				text: "关闭",
				click: function() {
					$dlg.dialog("destroy");
				}
			}],
			create: function(event, ui) {
				var $widget = $dlg.dialog("widget");
				var $info = $widget.find(".g_chat_info");
				if (detail.hasAvatar()) {
					$info.find(".u_avatar").attr("src", detail.avatar.toString());
				}
				$textarea.attr("id", "J_msg_" + detail.jid + "_" + detail.domain);
				$info.find(".u_nick").text(detail.personalInfo.nickname || detail.toString());
				$widget.find(".ui-dialog-titlebar").html($info);
				$widget.find(".ui-dialog-buttonpane").prepend($textarea);
			}
		});
		$dlg.attr("id", "J_chat_" + detail.jid + "_" + detail.domain);
		if (model && model.history && (unreadMessage = model.history[detail.toString()])) {
			$.each(unreadMessage, function(index, message) {
				drawMessage(message);
			});
			delete model.history[detail.toString()];
			Event.trigger("friend/message/remind", [detail.toUser(), 0]);
		}
	}

	function changeChatStatus(status) {
		var user = status.from;
		var type = status.type;
		var $dlg = $("#J_chat_" + user.jid + "_" + user.domain);
		if ($dlg) {
			var $status = $($dlg.dialog("widget")).find(".u_status");
			var statusMap = {
				"composing": "正在输入...",
				"active": "",
				"inactive": ""
			};
			if (type) {
				$status.text(statusMap[type]);
			} else {
				$status.text("");
			}
		}
	}

	function drawMessage(message) {
		var from = message.from;
		var to = message.to;
		var $dlg;
		var self = from.toString() === model.get("self").toString();
		$dlg = self ? $("#J_chat_" + to.jid + "_" + to.domain) : $("#J_chat_" + from.jid + "_" + from.domain);
		if ($dlg.length > 0) {
			var $message = $msgTpl.clone();
			var $ctn = $message.find("span");
			$ctn.html('<p>' + timeformat(message.time, "hh:mm:ss") + "：" + '</p>' + '<p>' + message.message + '</p>');
			$ctn.addClass("u_msg").addClass(self ? "u_self" : "u_other");
			$dlg.append($message);
		} else {
			var fromJid = from.toString();
			var history = (model.history = model.history || {});
			history[fromJid] = history[fromJid] || [];
			history[fromJid].push(message);
			Event.trigger("friend/message/remind", [from, history[fromJid].length]);
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
		}
	});
});