define(function(require, exports, module) {
	var Event = require("event");
	var connection = require("connect/connection");
	var pack = require("package/detail");
	var model = require("mods/model");
	Event.on({
		"connect.detail.getSelf": function() {
			console.log(pack.createSelf().xml());
			connection.getConnection().send(pack.createSelf(), {
				error_handler: function(e) {
					console.log("error", e);
					Event.trigger("detail.getSelf.fail");
				},
				result_handler: function(detail) {
					console.log("result", detail);
					Event.trigger("detail.getSelf.success", [pack.parse(detail)]);
				},
				default_handler: function(e) {
					console.log("default", e);
				}
			});
		},
	});
});