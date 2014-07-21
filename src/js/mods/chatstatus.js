define(function(require, exports, module) {
	var User = require("mods/user");
	var ChatStatus = function(type, from, to, time) {
		if (!this instanceof ChatStatus) {
			return new ChatStatus(type, from, to, time);
		}
		this.type = type;
		this.from = typeof from === "string" ? new User(from) : from;
		this.to = typeof to === "string" ? new User(to) : to;
		this.time = time;
	};
	module.exports = ChatStatus;
});