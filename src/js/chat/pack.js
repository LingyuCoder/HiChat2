define(function(require, exports, module) {
	var $ = require("jquery");

	var User = require("../mods/user");
	var Message = require("../mods/message");
	var ChatStatus = require("../mods/chatstatus");
	
	module.exports = {
		sendMessage: function(message) {
			var aMessage = new JSJaCMessage();
			aMessage.setTo(message.to.toString());
			aMessage.setBody(JSON.stringify(message.message));
			aMessage.setType("chat");
			return aMessage;
		},
		parse: function(aMessage) {
			var from = new User(aMessage.getFrom());
			var to = new User(aMessage.getTo());
			var $message = $(aMessage.getDoc());
			var $body = $message.find("body");
			var $delay = $message.find("delay");
			var time = $delay.length > 0 ? new Date($delay.attr("stamp")) : new Date();
			var result;
			if ($body.length > 0) {
				var parsedBody;
				try {
					parsedBody = JSON.parse($body.text());
				} catch(e) {
					parsedBody = $body.text();
				}
				result = new Message(parsedBody, from, to, time);
			} else {
				$.each(["active", "inactive", "composing"], function(index, status) {
					if ($message.find(status).length > 0) {
						result = new ChatStatus(status, from, to, time);
					}
				});
			}
			return result;
		}
	};
});