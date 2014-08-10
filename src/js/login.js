define(function(require, exports, module) {
	var $ = require("jquery");
	require("ui");
	var Event = require("event");
	var Connect = require("connect/login");
	var model = require("mods/model");
	var alertify = require("alertify");
	var $el = $("#J_login");

	$el.dialog({
		autoOpen: true,
		buttons: [{
			text: "登录",
			click: function() {
				var name, password;
				if ((name = $el.find(".J_name ").val()) && (password = $el.find(".J_pwd ").val())) {
					Event.trigger("connect/login/go", [name, password]);
				} else {
					//TODO: 显示用户名或密码未输入
				}
			}
		}],
		closeOnEscape: false,
		closeText: "关闭",
		draggable: false,
		resizable: false,
		title: "登录",
		modal: true
	});

	$($el.dialog("widget")).find(".ui-dialog-titlebar-close").remove();

	Event.on({
		"login/success": function(event, self) {
			model.set("self", self);
		},
		"login/fail": function(event, reason) {
			alertify.error(reason);
		},
		"detail/getSelf/success": function() {
			$el.dialog("close");
		},
		"logout/success": function() {
			$el.dialog("open");
			model.self = null;
			model.detail = null
			model.status = null;
			model.friends = null;
			model.groups = null;
			model.nicks = null;
			model.history = null;
		}
	});
});