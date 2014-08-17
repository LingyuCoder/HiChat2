define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	
	var model = require("../mods/model");

	require("./connect");
	
	
	var statusMap = {
		"chat": "在线",
		"away": "离开",
		"dnd": "忙碌"
	};
	var $el = $("#J_status");

	$el.on("change", function() {
		var newStatus = $el.val();
		Event.trigger("connect/status/send", [newStatus]);
		model.set("status", newStatus);
	});

	$.each(statusMap, function(value, text) {
		$el.append('<option value="' + value + '">' + text + '</option>');
	});

	Event.on({
		"detail/getSelf/success": function() {
			$el.val("chat");
			model.set("status", "chat");
		},
		"status/friend/receive": function(event, user, show, status) {
			var $friendStatus = $("#J_friend_" + user.toSafeString()).find(".u_status");
			$friendStatus.attr("class", "u_status u_status_" + show);
		}
	});
});