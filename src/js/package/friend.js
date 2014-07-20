define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var model = require("mods/model");
	var User = require("mods/user");
	module.exports = {
		list: function() {
			var aIQ = new JSJaCIQ(),
				queryNode = aIQ.setQuery(NS_ROSTER);
			aIQ.setType("get");
			return aIQ;
		},
		parseFriendList: function(friendList) {
			var friends = [];
			$("item", friendList.getQuery()).each(function() {
				var self = $(this);
				var user = new User(self.attr("jid"));
				friends.push(user);
			});
			return friends;
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
		"getFriendPresence": function() {
			return new JSJaCPresence();
		}
	};
});