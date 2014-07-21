define(function(require, exports, module) {
	var User = require("mods/user");
	var Message = function(message, from, to, time) {
		if (!this instanceof Message) {
			return new Message(message, from, to, time);
		}
		this.message = message;
		this.from = typeof from === "string" ? new User(from) : from;
		this.to = typeof to === "string" ? new User(to) : to;
		this.time = time;
	};
	module.exports = Message;
});