define(function(require, exports, module) {
	var Event = require("event");
	var $ = require("jquery");
	var RESOURCE = require("resource");
	var $chat = $('<div class="g_chat_dlg">' + '<div class="g_chat_info">' + '<img class="u_avatar" src="' + RESOURCE.DEFAULT_AVATAR + '"/>' + '<div class="u_nick"></div>' + '</div>' + '<div class="g_chat"></div>' + '<textarea class="u_msg"></textarea>' + '</div>');

	function initChatDialog(detail) {
		var $dlg = $chat.clone();
		var $textarea = $dlg.find(".u_msg");
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
					console.log($textarea.val());
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
	}

	Event.on({
		"chat.open": function(event, detail) {
			initChatDialog(detail);
		}
	});
});