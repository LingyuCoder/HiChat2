define(function(require, exports, module) {
	var Event = require("event");
	var connection = require("connect/connection").getConnection();

	var groupchatPack = require("package/groupchat");

	Event.on({
		"connect/groupchat/listroom": function() {
			connection.sendIQ(groupchatPack.listRoom(), {
				error_handler: function(error) {
					Event.trigger("groupchat/listroom/fail", [error]);
				},
				result_handler: function(rooms) {
					var rooms = groupchatPack.parseRoom(rooms);
					Event.trigger("groupchat/listroom/success", [rooms]);
				}
			});
		}
	});
});