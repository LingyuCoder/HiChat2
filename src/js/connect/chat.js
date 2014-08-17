define(function(require, exports, module) {
	var Event = require("event");
	var chatPack = require("package/chat");
	var ChatStatus = require("mods/chatstatus");
	var Message = require("mods/message");
	var connection = require("connect/connection").getConnection();

	Event.on({
		"connect/message/send": function(event, message) {
			connection.send(chatPack.sendMessage(message));
		},
		"connect/message/receive": function(event, aMessage) {
			var result = chatPack.parse(aMessage);
			if (result instanceof Message) {
				Event.trigger("message/receive", [result]);
			} else if (result instanceof ChatStatus) {
				Event.trigger("message/status", [result]);
			}
		}
	});
});