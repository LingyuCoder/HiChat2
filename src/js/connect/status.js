define(function(require, exports, module) {
	var connection = require("connect/connection").getConnection();
	var Event = require("event");
	var StatusPack = require("package/status");
	Event.on({
		"connect/status/send": function(event, status) {
			connection.send(StatusPack.sendStatus(status));
		}
	});
});