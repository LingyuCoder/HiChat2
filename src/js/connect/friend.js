define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var connection = require("connect/connection").getConnection();
	var friendPack = require("package/friend");
	var detailPack = require("package/detail");
	var sendedSubscribe = {};
	Event.on({
		"connect.friend.list": function() {
			connection.sendIQ(friendPack.list(), {
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
			connection.sendIQ(detailPack.getOther(friend), {
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
		"connect.friend.presence": function(event, user) {
			connection.send(friendPack.getFriendPresence(user));
		},
		"connect.friend.subscribe.send": function(event, user) {
			connection.send(friendPack.sendSubscribe(user));
			sendedSubscribe[user.toString()] = true;
		},
		"connect.friend.subscribed.send": function(event, user) {
			connection.send(friendPack.sendSubscribed(user));
			if (!sendedSubscribe[user.toString()]) {
				Event.trigger("connect.friend.subscribe.send", [user]);
			} else {
				delete sendedSubscribe[user.toString()];
			}
		},
		"connect.friend.unsubscribed.send": function(event, user) {
			connection.send(friendPack.sendUnsubscribed(user));
		},
		"connect.friend.unsubscribe.send": function(event, user) {
			connection.send(friendPack.sendUnsubscribe(user));
			Event.trigger("__connect.subscribe.remove", [user]);
		},
		"__connect.subscribe.remove": function(event, user) {
			connection.sendIQ(friendPack.sendRemoveSubscribe(user), {
				result_handler: function(aJSJaCPacket) {}
			});
		}
	});
});