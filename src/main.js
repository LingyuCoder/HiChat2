define(function(require, exports, module) {
	var $ = require("jquery");
	var $el = $("#J_main");
	var detail = require("detail");
	var friend = require("friend");
	var Event = require("event");

	Event.on({
		"login.success": function() {
			$el.show();
		},
		"login.fail": function() {
			$el.hide();
		}
	});
});