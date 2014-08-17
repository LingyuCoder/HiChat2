define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var connection = require("connect/connection").getConnection();
	var friendPack = require("package/friend");
	var detailPack = require("package/detail");
	var sendedSubscribe = {};
	Event.on({
		"connect/friend/list": function() {
			connection.sendIQ(friendPack.list(), {
				error_handler: function(error) {
					Event.trigger("friend/list/fail", [error]);
				},
				result_handler: function(friendList) {
					var parseRst = friendPack.parseFriendList(friendList);
					Event.trigger("friend/list/success", [parseRst.friends, parseRst.groups, parseRst.nicks]);
				}
			});
		},
		"connect/friend/detail": function(event, friend) {
			connection.sendIQ(detailPack.getOther(friend), {
				error_handler: function(error) {
					Event.trigger("friend/detail/fail", [error]);
				},
				result_handler: function(detail) {
					detail = detailPack.parse(detail);
					detail.jid = friend.jid;
					detail.domain = friend.domain;
					detail.resource = friend.resource;
					Event.trigger("friend/detail/success", [detail]);
				}
			});
		},
		"connect/friend/presence": function(event, user) {
			connection.send(friendPack.getFriendPresence(user));
		},
		"connect/friend/subscribe/send": function(event, user) {
			connection.send(friendPack.sendSubscribe(user));
			sendedSubscribe[user.toString()] = true;
		},
		"connect/friend/subscribed/send": function(event, user) {
			connection.send(friendPack.sendSubscribed(user));
			if (!sendedSubscribe[user.toString()]) {
				Event.trigger("connect/friend/subscribe/send", [user]);
			} else {
				delete sendedSubscribe[user.toString()];
			}
		},
		"connect/friend/unsubscribed/send": function(event, user) {
			connection.send(friendPack.sendUnsubscribed(user));
		},
		"connect/friend/unsubscribe/send": function(event, user) {
			connection.send(friendPack.sendUnsubscribe(user));
			Event.trigger("__connect/subscribe/remove", [user]);
		},
		"__connect/subscribe/remove": function(event, user) {
			connection.sendIQ(friendPack.sendRemoveSubscribe(user), {
				result_handler: function(aJSJaCPacket) {}
			});
		},
		"connect/friend/group/set": function(event, user, groupName) {
			connection.sendIQ(friendPack.setGroup(user, groupName), {
				error_handler: function(error) {
					Event.trigger("friend/group/set/fail", [error]);
				},
				result_handler: function(aJSJaCPacket) {
					Event.trigger("friend/group/set/success", [user, groupName]);
				}
			});
		},
		"connect/friend/nick/set": function(event, user, nick) {
			connection.sendIQ(friendPack.setNick(user, nick), {
				error_handler: function(error) {
					Event.trigger("friend/nick/set/fail", [error]);
				},
				result_handler: function(aJSJaCPacket) {
					Event.trigger("friend/nick/set/success", [user, nick]);
				}
			});
		},
		"connect/friend/presence/receive": function(event, presence) {
			presence = friendPack.parsePresence(presence);
			if (presence.type === "available" || presence.type === "unavailable") {
				Event.trigger("friend/presence/" + presence.type, [presence.user]);
				Event.trigger("status/friend/receive", [presence.user, presence.show, presence.status]);
			} else {
				Event.trigger("friend/" + presence.type + "/receive", [presence.user]);
				if (presence.type === "unsubscribe") {
					Event.trigger("__connect/subscribe/remove", [presence.user]);
				}
			}
		}
	});
});