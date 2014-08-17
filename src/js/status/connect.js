define(function(require, exports, module) {
	var connection = require("connection").getConnection();
	var Event = require("event");

	var StatusPack = require("./pack");
	Event.on({
		"connect/status/send": function(event, status) {
			connection.send(StatusPack.sendStatus(status));
		}
	});
});