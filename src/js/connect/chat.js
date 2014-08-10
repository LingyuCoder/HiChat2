define(function(require, exports, module) {
	var Event = require("event");
	var chatPack = require("package/chat");
	var connection = require("connect/connection").getConnection();

	Event.on({
		"connect/message/send": function(event, message) {
			connection.send(chatPack.sendMessage(message));
		}
	});
});