define(function(require, exports, module) {
	var Event = require("event");
	var connection = require("connect/connection");
	var config = require("config");
	var User = require("mods/user");
	var curUsername;

	Event.on({
		"connect/login/success": function() {
			Event.trigger("login/success", [new User(curUsername + "@" + config.domain + "/" + config.resource)]);
		},
		"connect/login/fail": function(event, reason) {
			Event.trigger("login/fail", [reason]);
		},
		"connect/login/go": function(event, username, password) {
			curUsername = username;
			connection.connect(username, password);
		}
	});
});