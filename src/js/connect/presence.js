define(function(require, exports, module) {
	var Connection = require("connect/connection");
	var Event = require("event");
	var PresencePack = require("package/presence");

	Event.on({
		"connect.friend.presence": function(event) {
			Connection.getConnection().send(PresencePack.getFriendPersence());
		}
	});
});