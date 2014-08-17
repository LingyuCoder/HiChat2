define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var alertify = require("alertify");

	var model = require("../mods/model");
	
	require("detail/view");
	require("friend/view");
	require("chat/view");
	require("status/view");
	require("groupchat/view");
	require("./main.css");

	var $el = $("#J_main");
	var $toolbar = $('#J_tool');

	alertify.set({
		labels: {
			ok: "确认",
			cancel: "取消"
		}
	});

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

	$toolbar.find(".u_search").on("click", function(event) {
		Event.trigger("friend/search/open");
	});

	$toolbar.find(".u_self").on("click", function(event) {
		Event.trigger("detail/show");
	});

	$toolbar.find(".u_exit").on("click", function(event) {
		Event.trigger("connect/logout");
	});

	$("#J_tabs").tabs();

	Event.on({
		"detail/getSelf/success": function() {
			$($el.dialog("widget")).find(".ui-dialog-titlebar").html($("#J_detail"));
			$el.dialog("open");
		},
		"login/fail": function() {
			$el.hide();
		},
		"logout/success": function() {
			$el.dialog("close");
		}
	});
});