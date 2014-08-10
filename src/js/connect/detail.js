define(function(require, exports, module) {
	var Event = require("event");
	var connection = require("connect/connection").getConnection();
	var pack = require("package/detail");
	var model = require("mods/model");

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
		}
	});
});