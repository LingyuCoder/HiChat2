define(function(require, exports, module) {
	var Event = require("event");
	var connection = require("connection").getConnection();

	var model = require("mods/model");

	var pack = require("./pack");

	Event.on({
		"connect/detail/getSelf": function() {
			connection.sendIQ(pack.getSelf(), {
				error_handler: function(e) {
					Event.trigger("detail/getSelf/fail");
				},
				result_handler: function(detail) {
					var self = model.get("self");
					detail = pack.parse(detail);
					detail.jid = self.jid;
					detail.domain = self.domain;
					detail.resource = self.resource;
					Event.trigger("detail/getSelf/success", [detail]);
				}
			});
		},
		"connect/detail/setSelf": function(event, detail) {
			console.log(pack.setSelf(detail).xml());
			connection.sendIQ(pack.setSelf(detail), {
				error_handler: function(aJSJaCPacket) {
					Event.trigger("detail/setSelf/fail");
				},
				result_handler: function(aJSJaCPacket) {
					Event.trigger("detail/setSelf/success", [detail]);
				}
			});
		},
		"connect/detail/other": function(event, friend) {
			connection.sendIQ(pack.getOther(friend), {
				error_handler: function(error) {
					Event.trigger("friend/detail/fail", [error]);
				},
				result_handler: function(detail) {
					detail = pack.parse(detail);
					detail.jid = friend.jid;
					detail.domain = friend.domain;
					detail.resource = friend.resource;
					Event.trigger("friend/detail/success", [detail]);
				}
			});
		}
	});
});