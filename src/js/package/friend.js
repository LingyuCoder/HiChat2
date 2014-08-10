define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var model = require("mods/model");
	var User = require("mods/user");
	var Group = require("mods/group");
	module.exports = {
		list: function() {
			var aIQ = new JSJaCIQ(),
				queryNode = aIQ.setQuery(NS_ROSTER);
			aIQ.setType("get");
			return aIQ;
		},
		parseFriendList: function(friendList) {
			var friends = [];
			var groups = {};
			var nicks = {};
			$("item", friendList.getQuery()).each(function() {
				var self = $(this);
				var group = self.find("group");
				var jid = self.attr("jid");
				var groupName = group.length > 0 ? group.text() : '__default__';
				var user = new User(jid);
				var nick = self.attr("name");
				if (nick) {
					nicks[jid] = nick;
				}

				groups[groupName] = groups[groupName] || new Group(groupName);
				groups[groupName].add(user);
				friends.push(user);
			});
			return {
				friends: friends,
				groups: groups,
				nicks: nicks
			};
		},
		"parsePresence": function(aPresence) {
			var type = aPresence.getType() || "available";
			var user = new User(aPresence.getFrom());
			var result = {
				type: type,
				user: user
			};
			if (type === "unavailable" || type === "available") {
				result.show = aPresence.getShow();
				result.status = aPresence.getStatus();
			}
			return result;
		},
		"getFriendPresence": function(to) {
			var aPresence = new JSJaCPresence();
			if (to) {
				aPresence.setTo(to.toString());
			}
			return aPresence;
		},
		"sendSubscribe": function(user) {
			var aPresence = new JSJaCPresence();
			aPresence.setTo(user.toString());
			aPresence.setType("subscribe");
			return aPresence;
		},
		"sendUnsubscribe": function(user) {
			var aPresence = new JSJaCPresence();
			aPresence.setTo(user.toString());
			aPresence.setType("unsubscribe");
			return aPresence;
		},
		"sendUnsubscribed": function(user) {
			var aPresence = new JSJaCPresence();
			aPresence.setTo(user.toString());
			aPresence.setType("unsubscribed");
			return aPresence;
		},
		"sendSubscribed": function(user) {
			var aPresence = new JSJaCPresence();
			aPresence.setTo(user.toString());
			aPresence.setType("subscribed");
			return aPresence;
		},
		"sendRemoveSubscribe": function(user) {
			var aIQ = new JSJaCIQ(),
				queryNode,
				itemNode;
			aIQ.setType("set");
			queryNode = aIQ.setQuery(NS_ROSTER);
			itemNode = aIQ.buildNode("item");
			itemNode.setAttribute("jid", user.toString());
			itemNode.setAttribute("subscription", "remove");
			queryNode.appendChild(itemNode);
			return aIQ;
		},
		"setGroup": function(user, groupName) {
			var aIQ = new JSJaCIQ(),
				queryNode = aIQ.setType("set").setQuery(NS_ROSTER),
				itemNode = aIQ.buildNode("item"),
				i;
			itemNode.setAttribute("jid", user.toString());
			itemNode.appendChild(aIQ.buildNode("group", groupName));
			queryNode.appendChild(itemNode);
			return aIQ;
		},
		"setNick": function(user, nick) {
			var aIQ = new JSJaCIQ(),
				queryNode = aIQ.setType("set").setQuery(NS_ROSTER),
				itemNode = aIQ.buildNode("item"),
				i;
			itemNode.setAttribute("jid", user.toString());
			itemNode.setAttribute("name", nick);
			queryNode.appendChild(itemNode);
			return aIQ;
		}
	};
});