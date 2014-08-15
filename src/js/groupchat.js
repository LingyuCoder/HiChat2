define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var alertify = require("alertify");
	var model = require("mods/model");
	var $el = $("#J_groupchat");
	var $roomTpl = $('<div class="g-room"><span class="u-join">加入</span><div class="u-name"></div></div>');
	require("connect/groupchat");

	function drawRooms() {
		var rooms = model.rooms;
		$el.html("");
		$.each(rooms, function(index, room) {
			try {
				var $room = $roomTpl.clone();
				$room.find('.u-name').text(room.name);
				$room.find('.u-join').button().on("click", function(event) {
					console.log(room);
				});
				$el.append($room);
			} catch (e) {
				console.error(e.stack);
			}

		});
	}

	Event.on({
		"groupchat/listroom/fail": function() {
			alertify.error("获取房间列表失败");
		},
		"groupchat/listroom/success": function(event, rooms) {
			console.log(rooms);
			model.rooms = rooms;
			drawRooms();
		},
		"login/success": function(event, self) {
			Event.trigger("connect/groupchat/listroom");
		},
		"logout/success": function() {
			$el.html("");
		}
	});
});