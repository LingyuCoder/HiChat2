define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var model = require("mods/model");
	var RESOURCE = require("resource");
	var alertify = require("alertify");
	require("connect/friend");


	var $findDlg = $("#J_friend_find");
	var $el = $("#J_friend");
	var $tpl = $('<li class="g_friend"><img src="' + RESOURCE.DEFAULT_AVATAR + '" alt="" class="u_avatar" /><div class="u_cfg"><span class="iconfont">&#xe602;</span></div><div class="u_nick"></div></li>');
	var $cfgTpl = $('<ul class="u_cfg_list"><li class="u_cfg_item J_f_detail">详细信息</li><li class="u_cfg_item J_f_remove">删除好友</li><li class="u_cfg_item J_f_group">设置分组</li></ul>');
	var $detailDlg = $("#J_friend_detail");
	var $subReqTpl = $('<div class="J_req_dlg"></div>');

	$detailDlg.find(".J_tabs").tabs();
	var dlgCfg = {
		autoOpen: false,
		closeOnEscape: true,
		closeText: "关闭",
		draggable: true,
		resizable: false,
		width: 400,
		height: 300,
		modal: false
	};
	$detailDlg.dialog(dlgCfg);

	$findDlg.dialog(dlgCfg);

	function drawFriend(user) {
		var $friend = $tpl.clone();
		var $avatar = $friend.find(".u_avatar");
		var $nick = $friend.find(".u_nick");
		$nick.text(user.toString());
		var id = "J_friend_" + user.jid + "_" + user.domain;
		if ($("#" + id).length > 0) {
			return;
		}
		$friend.attr("id", id).addClass("z_offline");
		var $cfg = initCfg(user);
		$friend.find(".u_cfg").append($cfg);
		$el.append($friend);
	}

	function deleteFriend(user) {
		$.each(["J_friend_", "J_f_cfg_", "J_f_detail_"], function(index, item) {
			var $dlg = $("#" + item + user.jid + "_" + user.domain);
			$dlg.dialog().dialog("destroy");
			$dlg.remove();
		});
	}

	function initCfg(user) {
		var $cfg = $cfgTpl.clone();
		var id = "J_f_cfg_" + user.jid + "_" + user.domain;
		if ($("#" + id).length > 0) {
			return;
		}
		$cfg.attr("id", id);
		$cfg.find(".J_f_remove").on("click", function() {
			deleteFriend(user);
			Event.trigger("connect.friend.unsubscribe.send", [user]);
		});
		$cfg.on("click", function(event) {
			event.stopPropagation();
			event.preventDefault();
		});
		return $cfg;
	}

	function drawFriendDetail(detail) {
		var $friend = $("#J_friend_" + detail.jid + "_" + detail.domain);
		if ($friend.length === 0) {
			return;
		}
		var $avatar = $friend.find(".u_avatar");
		var $nick = $friend.find(".u_nick");
		var $cfg = $("#J_f_cfg_" + detail.jid + "_" + detail.domain);
		if (detail.hasAvatar()) {
			$avatar.attr("src", detail.avatar.toString());
		}
		$cfg.find(".J_f_detail").on("click", function() {
			$.each(["personal", "work", "home"], function(index, type) {
				var item;
				var hasOwnProperty = Object.prototype.hasOwnProperty;
				var $element = $("#tab_fd_" + type);
				var info = detail[type + "Info"];
				for (item in info) {
					if (hasOwnProperty.call(info, item)) {
						$element.find("." + item).text(info[item]);
					}
				}
			});
			$detailDlg.dialog("option", "title", $nick.text() + "的名片").dialog("open");
		});
		$friend.on("click", function(event) {
			Event.trigger("chat.open", [detail]);
		});
		$nick.text(detail.personalInfo.nickname || detail.toString());
	}

	function drawSubscribeRequest(user) {
		var $dlg = $subReqTpl.clone();
		$dlg.text(user.toString() + "请求加您为好友");
		$dlg.attr("id", "J_req_dlg_" + user.jid + "_" + user.domain);
		$dlg.dialog({
			autoOpen: true,
			closeOnEscape: true,
			closeText: "下次处理",
			draggable: true,
			resizable: false,
			width: 400,
			height: 300,
			modal: false,
			title: "新的好友请求",
			buttons: [{
				text: "接受",
				click: function() {
					Event.trigger("connect.friend.subscribed.send", [user]);
					drawFriend(user);
					getNewFriendInfo(user);
					$dlg.dialog("destroy");
				}
			}, {
				text: "拒绝",
				click: function() {
					Event.trigger("connect.friend.unsubscribed.send", [user]);
					$dlg.dialog("destroy");
				}
			}],
		});
	}

	function getNewFriendInfo(user) {
		Event.trigger("connect.friend.detail", [user]);
		Event.trigger("connect.friend.presence", [user]);
	}

	Event.on({
		"login.success": function() {
			Event.trigger("connect.friend.list");
		},
		"friend.list.success": function(event, friends) {
			//TODO: 获取到好友列表
			model.addFriend(friends);
			$.each(friends, function(index, friend) {
				drawFriend(friend);
				Event.trigger("connect.friend.detail", [friend]);
			});
			Event.trigger("connect.friend.presence");
		},
		"friend.presence.available": function(event, user) {
			var $friend = $("#J_friend_" + user.jid + "_" + user.domain);
			if ($friend.length === 0) {
				return;
			}
			$friend.removeClass("z_offline");
			$el.prepend($friend);
		},
		"friend.presence.unavailable": function(event, user) {
			var $friend = $("#J_friend_" + user.jid + "_" + user.domain);
			if ($friend.length === 0) {
				return;
			}
			if (!$friend.hasClass("z_offline")) {
				$friend.addClass("z_offline");
			}
			$el.append($friend);
		},
		"friend.list.fail": function() {
			alertify.error("获取好友列表失败");
		},
		"friend.detail.success": function(event, detail) {
			model.toDetailFriend(detail);
			drawFriendDetail(detail);
		},
		"friend.detail.fail": function() {
			alertify.error("获取好友详情失败");
		},
		"friend.subscribe.send.fail": function(event, user) {
			alertify.error("发送好友请求失败");
		},
		"friend.subscribe.receive": function(event, user) {
			drawSubscribeRequest(user);
		},
		"friend.unsubscribe.receive": function(event, user) {
			deleteFriend(user);
		},
		"friend.subscribed.receive": function(event, user) {
			drawFriend(user);
			getNewFriendInfo(user);
		},
		"friend.unsubscribed.receive": function(event, user) {
			alertify.error(user.toString() + "拒绝了你的好友请求");
		}
	});
});