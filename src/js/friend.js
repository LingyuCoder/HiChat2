define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var model = require("mods/model");
	var RESOURCE = require("resource");
	require("connect/friend");

	var $el = $("#J_friend");
	var $tpl = $('<li class="g_friend"><img src="' + RESOURCE.DEFAULT_AVATAR + '" alt="" class="u_avatar" /><div class="u_cfg"><span class="iconfont">&#xe602;</span></div><div class="u_nick"></div></li>');
	var $cfgTpl = $('<ul class="u_cfg_list"><li class="u_cfg_item J_f_detail">详细信息</li><li class="u_cfg_item J_f_remove">删除好友</li><li class="u_cfg_item J_f_group">设置分组</li></ul>');
	var $fd = $("#J_friend_detail");

	$fd.find(".J_tabs").tabs();

	$fd.dialog({
		autoOpen: false,
		closeOnEscape: true,
		closeText: "关闭",
		draggable: true,
		resizable: false,
		width: 400,
		height: 300,
		modal: false
	});

	function drawFriend(user) {
		var $friend = $tpl.clone();

		var $avatar = $friend.find(".u_avatar");
		var $nick = $friend.find(".u_nick");
		$nick.text(user.toString());
		$friend.attr("id", "J_friend_" + user.jid + "_" + user.domain).addClass("z_offline");
		var $cfg = initCfg(user);
		$friend.find(".u_cfg").append($cfg);
		$el.append($friend);
	}

	function initCfg(user) {
		var $cfg = $cfgTpl.clone();
		var id = "J_f_cfg_" + user.jid + "_" + user.domain;
		$cfg.attr("id", id);
		$cfg.find(".J_f_remove").on("click", function() {
			Event.trigger("connect.friend.remove", [user]);
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
		console.log($cfg.find(".J_f_detail"));
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
			$fd.dialog("option", "title", $nick.text() + "的名片").dialog("open");
		});
		$friend.on("click", function(event) {
			Event.trigger("chat.open", [detail]);
		});
		$nick.text(detail.personalInfo.nickname || detail.toString());
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
				Event.trigger("connect.friend.detail", friend);
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
			alert("获取好友列表失败");
			//TODO: 获取好友列表失败
		},
		"friend.detail.success": function(event, detail) {
			model.toDetailFriend(detail);
			drawFriendDetail(detail);
			//TODO: 获取到好友详情
		},
		"friend.detail.fail": function() {
			alert("获取好友详情失败");
		}
	});
});