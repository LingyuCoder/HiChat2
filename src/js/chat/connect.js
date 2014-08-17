define(function(require, exports, module) {
	var Event = require("event");
	var connection = require("connection").getConnection();
	
	var ChatStatus = require("../mods/chatstatus");
	var Message = require("../mods/message");
	
	var chatPack = require("./pack");

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