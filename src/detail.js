define(function(require, exports, module) {
	var $ = require("jquery");
	var model = require("mods/model");
	var Event = require("event");
	require("connect/detail");

	var $el = $("#J_main");

	Event.on({
		"login.success": function() {
			console.log("getting self");
			$el.show();
			Event.trigger("connect.detail.getSelf");
		},
		"detail.getSelf.success": function(detail) {
			console.log("asdf");
			console.log(detail);
			//TODO: 获取个人信息成功，输出
		},
		"detail.getSelf.fail": function() {
			//TODO: 获取个人信息失败
			alert("获取个人信息失败");
		}
	});
});