define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var model = require("mods/model");
	require("connect/friend");

	Event.on({
		"login.success": function() {
			Event.trigger("connect.friend.list");
		},
		"friend.list.success": function(event, friends) {
			//TODO: 获取到好友列表
			model.addFriend(friends);
			$.each(friends, function(index, friend) {
				Event.trigger("connect.friend.detail", friend);
			});
		},
		"friend.list.fail": function() {
			alert("获取好友列表失败");
			//TODO: 获取好友列表失败
		},
		"friend.detail.success": function(event, detail) {
			model.toDetailFriend(detail);
			console.log(detail);
			//TODO: 获取到好友详情
		},
		"friend.detail.fail": function() {
			alert("获取好友详情失败");
		}
	});
});