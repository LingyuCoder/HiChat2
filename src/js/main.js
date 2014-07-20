define(function(require, exports, module) {
	var $ = require("jquery");
	var $el = $("#J_main");
	require("detail");
	require("friend");
	require("chat");
	var Event = require("event");
	var model = require("mods/model");

	$el.dialog({
		autoOpen: false,
		closeOnEscape: false,
		closeText: "关闭",
		draggable: true,
		height: 600,
		width: 300,
		resizable: false,
		modal: false,
		position: {
			my: "right center",
			at: "right-150 center"
		}
	});

	Event.on({
		"detail.getSelf.success": function() {
			$($el.dialog("widget")).find(".ui-widget-header").html($("#J_detail"));
			$el.dialog("open");
		},
		"login.fail": function() {
			$el.hide();
		}
	});
});