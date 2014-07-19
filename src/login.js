define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var Connect = require("connect/login");
	var model = require("mods/model");

	var $el = $("#J_login");

	Event.on({
		"login.success": function(event, self) {
			model.setSelf(self);
			$el.hide();
			//登陆成功后，登陆框后续处理
		},
		"login.fail": function(event, reason) {
			alert(reason);
			//TODO：输出错误原因
		}
	});

	$el.find(".J_submit ").on("click ", function(event) {
		var name, password;
		if ((name = $el.find(".J_name ").val()) && (password = $el.find(".J_pwd ").val())) {
			Event.trigger("connect.login.go", [name, password]);
		} else {
			//TODO: 显示用户名或密码未输入
		}
	});
});