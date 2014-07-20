define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var connection = require("connect/connection");
	var friendPack = require("package/friend");
	var detailPack = require("package/detail");

	Event.on({
		"connect.friend.list": function() {
			connection.getConnection().sendIQ(friendPack.list(), {
				error_handler: function(error) {
					Event.trigger("friend.list.fail");
				},
				result_handler: function(friendList) {
					var friends = friendPack.parseFriendList(friendList);
					Event.trigger("friend.list.success", [friends]);
				},
				default_handler: function(aJSJaCPacket) {
					console.log(aJSJaCPacket.xml());
				}
			});
		},
		"connect.friend.detail": function(event, friend) {
			connection.getConnection().sendIQ(detailPack.getOther(friend), {
				error_handler: function(error) {
					console.log(error);
					Event.trigger("friend.detail.fail");
				},
				result_handler: function(detail) {
					detail = detailPack.parse(detail);
					detail.jid = friend.jid;
					detail.domain = friend.domain;
					detail.resource = friend.resource;
					Event.trigger("friend.detail.success", [detail]);
				},
				default_handler: function(aJSJaCPacket) {
					console.log("default");
				}
			});
		},
		"connect.friend.presence": function(event) {
			try {
				connection.getConnection().send(friendPack.getFriendPresence());
			} catch (e) {
				console.error(e.stack);
			}
		}
	});
});