define(function(require, exports, module) {
	var connection = require("connect/connection").getConnection();
	var Event = require("event");
	var PresencePack = require("package/presence");

	Event.on({
		"connect.friend.presence": function(event) {
			connection.send(PresencePack.getFriendPersence());
		}
	});
});