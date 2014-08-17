define(function(require, exports, module) {
	var $ = require("jquery");
	var RoomUser = require("mods/roomuser");

	function GroupchatMessage(roomUser, message, time) {
		if (!(this instanceof GroupchatMessage)) {
			return new GroupchatMessage(roomUser, message, time);
		}
		this.roomUser = typeof roomUser === "string" ? new RoomUser(roomUser) : roomUser;
		this.message = message;
		this.time = typeof time === "number" || typeof time === "string" ? new Date(time) : time;
	}

	$.extend(GroupchatMessage.prototype, {
		toString: function() {
			return this.message;
		}
	});

	module.exports = GroupchatMessage;
});