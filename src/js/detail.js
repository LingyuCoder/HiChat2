define(function(require, exports, module) {
	var $ = require("jquery");
	var RESOURCE = require("resource");
	var model = require("mods/model");
	var Event = require("event");
	require("connect/detail");

	var $el = $("#J_detail");

	var drawDetail = function(detail) {
		var $avatar = $el.find(".u_avatar");
		var $nick = $el.find(".u_nick");
		var $state = $el.find(".u_state");
		if (detail.hasAvatar()) {
			$avatar.attr("src", detail.avatar.toString());
		} else {
			$avatar.attr("src", RESOURCE.DEFAULT_AVATAR);
		}
		$avatar.on("click", function(event) {
			//TODO: 打开个人信息编辑窗口
		});
		$nick.text(detail.personalInfo.nickname || detail.jid);
		//TODO：更多个人信息展示
	};

	Event.on({
		"login/success": function() {
			Event.trigger("connect/detail/getSelf");
		},
		"detail/getSelf/success": function(event, detail) {
			model.set("detail", detail);
			drawDetail(detail);
			//TODO: 获取个人信息成功，输出
		},
		"detail/getSelf/fail": function() {
			//TODO: 获取个人信息失败
			alert("获取个人信息失败");
		}
	});
});