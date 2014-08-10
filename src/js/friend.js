define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var model = require("mods/model");
	var User = require("mods/user");
	var config = require("config");
	var RESOURCE = require("resource");
	var alertify = require("alertify");
	var util = require("util");
	var Group = require("mods/group");
	require("connect/friend");


	var $findDlg = $("#J_friend_find");
	var $findId = $findDlg.find(".J_f_find_id");
	var $findResult = $findDlg.find(".J_f_find_rst");
	var $el = $("#J_friend");
	var $tpl = $('<div class="g_friend"><img src="' + RESOURCE.DEFAULT_AVATAR + '" alt="" class="u_avatar" /><span class="u_status"></span><div class="u_cfg"><span class="iconfont">&#xe602;</span></div><div class="u_nick"></div></div>');
	var $cfgTpl = $('<ul class="u_cfg_list"><li class="u_cfg_item J_f_detail">详细信息</li><li class="u_cfg_item J_f_group">设置分组</li><li class="u_cfg_item J_f_nick">设置备注</li><li class="u_cfg_item J_f_remove">删除好友</li></ul>');
	var $detailDlg = $("#J_friend_detail");
	var $subReqTpl = $('<div class="J_req_dlg"></div>');

	var sendedSubscribe = {};

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
	$detailDlg.dialog(util.merge({}, dlgCfg));

	$findDlg.dialog(util.merge({}, dlgCfg, {
		buttons: [{
			text: "查找",
			click: function() {
				var jid = $.trim($findId.val());
				var user;
				if (jid) {
					jid += jid.indexOf('@') !== -1 ? "" : ("@" + config.domain);
					user = new User(jid);
					Event.trigger("connect/friend/subscribe/send", [user]);
					sendedSubscribe[user.toString()] = true;
				}
			}
		}, {
			text: "关闭",
			click: function() {
				$findDlg.dialog("close");
			}
		}],
		title: "查找"
	}));

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
			Event.trigger("connect/friend/unsubscribe/send", [user]);
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
		$cfg.find(".J_f_group").on("click", function() {
			alertify.prompt("请输入分组名称：", function(e, groupName) {
				if (e) {
					Event.trigger("connect/friend/group/set", [detail.toUser(), groupName]);
				}
			});
		});
		$cfg.find(".J_f_nick").on("click", function() {
			alertify.prompt("请输入备注：", function(e, nick) {
				if (e) {
					Event.trigger("connect/friend/nick/set", [detail.toUser(), nick]);
				}
			});
		});
		$friend.on("click", function(event) {
			Event.trigger("chat/open", [detail]);
		});
		$nick.text(model.get("nicks")[detail.toString()] || detail.personalInfo.nickname || detail.toString());
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
					Event.trigger("connect/friend/subscribed/send", [user]);
					Event.trigger("connect/friend/subscribe/send", [user]);
					drawFriend(user);
					getNewFriendInfo(user);
					$dlg.dialog("destroy");
				}
			}, {
				text: "拒绝",
				click: function() {
					Event.trigger("connect/friend/unsubscribed/send", [user]);
					$dlg.dialog("destroy");
				}
			}],
		});
	}

	function getNewFriendInfo(user) {
		Event.trigger("connect/friend/detail", [user]);
		Event.trigger("connect/friend/presence", [user]);
	}

	function drawGroups() {
		var groups = model.get("groups");
		var $accordion = $el;

		$.each(groups, function(name, group) {
			var $groupName = $('<h3>' + name + '</h3>');
			$group = $('<div id="J_group_' + name + '" class="J_group"></div>');
			$accordion.append($groupName).append($group);
			$.each(group.list, function(index, user) {
				$group.append($('#J_friend_' + user.jid + '_' + user.domain));
			});
		});
		$accordion.accordion({
			heightStyle: "fill",
			collapsible: true
		})
	}

	function changeGroup(user, oldName, groupName) {
		var groups = model.get("groups");
		var $accordion = $el;
		var $group = $('#J_group_' + groupName);
		if ($group.length === 0) {
			var $groupName = $('<h3>' + groupName + '</h3>');
			$group = $('<div id="J_group_' + groupName + '" class="J_group"></div>');
			$accordion.append($groupName).append($group);
		}
		$group.append($('#J_friend_' + user.jid + '_' + user.domain));
		$group = $("#J_group_" + oldName);
		if (!groups[oldName] || groups[oldName].count() === 0) {
			$group.prev().remove();
			$group.remove();
		}
		$accordion.accordion("refresh");

	}

	function drawNicks() {
		var nicks = model.get("nicks");
		$.each(nicks, function(jid, nick) {
			var user = new User(jid);
			var $friend;
			if (nicks[jid] && ($friend = $('#J_friend_' + user.jid + '_' + user.domain)).length > 0) {
				$friend.find(".u_nick").text(nicks[jid]);
			}
		});
	}

	function changeNick(friend, nick) {
		var $friend;
		if (($friend = $('#J_friend_' + friend.jid + '_' + friend.domain)).length > 0) {
			$friend.find(".u_nick").text(nick);
		}
	}

	Event.on({
		"login/success": function() {
			Event.trigger("connect/friend/list");
		},
		"friend/search/open": function(event) {
			$findDlg.dialog("open");
		},
		"friend/list/success": function(event, friends, groups, nicks) {
			//TODO: 获取到好友列表
			model.set("friends", friends);
			$.each(friends, function(index, friend) {
				drawFriend(friend);
				Event.trigger("connect/friend/detail", [friend]);
			});
			model.set("groups", groups);
			model.set("nicks", nicks);
			drawGroups();
			drawNicks();
			Event.trigger("connect/friend/presence");
		},
		"friend/presence/available": function(event, user) {
			var $friend = $("#J_friend_" + user.jid + "_" + user.domain);
			if ($friend.length === 0) {
				return;
			}
			$friend.removeClass("z_offline");
			$friend.parent().prepend($friend);
		},
		"friend/presence/unavailable": function(event, user) {
			var $friend = $("#J_friend_" + user.jid + "_" + user.domain);
			if ($friend.length === 0) {
				return;
			}
			if (!$friend.hasClass("z_offline")) {
				$friend.addClass("z_offline");
			}
			$el.append($friend);
		},
		"friend/list/fail": function() {
			alertify.error("获取好友列表失败");
		},
		"friend/detail/success": function(event, detail) {
			var friends = model.get("friends");
			for (var i = friends.length; i--;) {
				if (friends[i].toString() === detail.toString()) {
					friends[i] = detail;
				}
			}
			drawFriendDetail(detail);
		},
		"friend/detail/fail": function() {
			alertify.error("获取好友详情失败");
		},
		"friend/subscribe/send/fail": function(event, user) {
			alertify.error("发送好友请求失败");
		},
		"friend/subscribe/receive": function(event, user) {
			if (!sendedSubscribe[user.toString()]) {
				drawSubscribeRequest(user);
			} else {
				Event.trigger("connect/friend/subscribed/send", [user]);
				delete sendedSubscribe[user.toString()];
			}

		},
		"friend/unsubscribe/receive": function(event, user) {
			deleteFriend(user);
		},
		"friend/subscribed/receive": function(event, user) {
			drawFriend(user);
			getNewFriendInfo(user);
		},
		"friend/unsubscribed/receive": function(event, user) {
			alertify.error(user.toString() + "拒绝了你的好友请求");
		},
		"connect/friend/group/set/fail": function(event, error) {
			alertify.error("设置分组失败");
		},
		"connect/friend/group/set/success": function(event, friend, groupName) {
			var groups = model.get("groups");
			var oldName;
			$.each(groups, function(name, group) {
				if (group.index(friend) !== -1) {
					oldName = name;
					group.remove(friend);
					if (0 === group.count()) {
						delete groups[name];
					}
				}
			});
			groups[groupName] = groups[groupName] || new Group(groupName);
			groups[groupName].add(friend);
			changeGroup(friend, oldName, groupName);
		},
		"connect/friend/nick/set/fail": function(event) {
			alertify.error("设置备注失败");
		},
		"connect/friend/nick/set/success": function(event, friend, nick) {
			var nicks = model.get("nicks");
			nicks[friend.toString()] = nick;
			changeNick(friend, nick);
		}
	});
});