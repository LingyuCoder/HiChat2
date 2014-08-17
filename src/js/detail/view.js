define(function(require, exports, module) {
	var $ = require("jquery");
	var RESOURCE = require("resource");
	var Event = require("event");
	var alertify = require("alertify");

	var model = require("../mods/model");
	var HomeInfo = require("../mods/homeinfo");
	var WorkInfo = require("../mods/workinfo");
	var PersonalInfo = require("../mods/personalinfo");
	var Avatar = require("../mods/avatar");
	var Detail = require("../mods/detail");
	
	require("./connect");

	var $el = $("#J_detail");
	var $selfDlg = $("#J_self_detail");
	var $avatar = $("#J_avatar");
	var $avatarPreview = $("#J_avatar_preview");

	$selfDlg.dialog({
		autoOpen: false,
		closeOnEscape: true,
		closeText: "关闭",
		draggable: true,
		resizable: false,
		width: 400,
		height: 300,
		modal: false,
		buttons: [{
			text: "修改",
			click: function() {
				var mapping = {
					"personal": PersonalInfo,
					"work": WorkInfo,
					"home": HomeInfo
				};
				var detailParams = {};
				var avatar;
				$.each(mapping, function(type, Construct) {
					var $ctn = $("#tab_sd_" + type);
					var params = {};
					$.each($ctn.find("input"), function(index, $input) {
						$input = $($input);
						params[$input.attr("name")] = $input.val();
					});
					detailParams[type + "Info"] = Construct(params);
				});

				if ((avatar = $avatarPreview.data("avatar") || model.detail.avatar)) {
					detailParams.avatar = avatar;
				}
				var detail = new Detail(detailParams);
				Event.trigger("connect/detail/setSelf", [detail]);
			}
		}, {
			text: "关闭",
			click: function() {
				$selfDlg.dialog("close");
			}
		}],
		title: "我的名片"
	});

	$selfDlg.find(".J_tabs").tabs();

	var rDataURL = /^data:(\w+\/\w+);base64,(.*)/;

	$avatar.on("change", function(event) {
		var file = this.files[0];
		var reader = new FileReader();
		if (/image/.test(file.type)) {
			reader.readAsDataURL(file);
		}
		reader.onload = function(event) {
			var imgData = event.target.result;
			var binval = rDataURL.exec(imgData);

			$avatarPreview.attr("src", imgData).data("avatar", new Avatar({
				type: file.type,
				binval: binval[2]
			}));
		};
	});

	var drawDetail = function(detail) {
		var $avatar = $el.find(".u_avatar");
		var $nick = $el.find(".u_nick");
		var $state = $el.find(".u_state");
		if (detail.hasAvatar()) {
			$avatar.attr("src", detail.avatar.toString());
		} else {
			$avatar.attr("src", RESOURCE.DEFAULT_AVATAR);
		}
		$nick.text(detail.personalInfo.nickname || detail.jid);
	};

	Event.on({
		"login/success": function() {
			Event.trigger("connect/detail/getSelf");
		},
		"detail/getSelf/success": function(event, detail) {
			model.set("detail", detail);
			drawDetail(detail);
		},
		"detail/getSelf/fail": function() {
			alertify.error("获取个人信息失败");
		},
		"detail/setSelf/fail": function() {
			alertify.error("设置个人信息失败");
		},
		"detail/setSelf/success": function(event, detail) {
			model.set("detail", detail);
			drawDetail(detail);
			alertify.success("设置个人信息成功");
		},
		"detail/show": function() {
			var detail = model.get("detail");
			$.each(["personal", "work", "home"], function(index, type) {
				var item;
				var $element = $("#tab_sd_" + type);
				var info = detail[type + "Info"];
				$.each(info, function(item, value) {
					$element.find("." + item).find("input").val(value);
				});
				if (detail.hasAvatar()) {
					$avatarPreview.attr("src", detail.avatar.toString());
				}
			});
			$selfDlg.dialog("open");
		}
	});
});