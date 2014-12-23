define(function(require, exports, module) {
	var $ = require("jquery");
	var Event = require("event");
	var alertify = require("alertify");

	require("./connect");
	require("./groupchat.css");

	var model = require("../mods/model");
	var RoomUser = require("../mods/roomuser");
	var GroupChatMessage = require('../mods/groupchatmessage');

	var $el = $("#J_groupchat");
	var $roomTpl = $('<div class="g_room"><div class="u_name"></div></div>');
	var $roomDlgTpl = $('<div class="g_gc_dlg"><div class="g_left"><div class="m_msg"></div><div class="g_ipt"><textarea class="u_ipt"></textarea></div></div><div class="g_right"><div class="u_subject"></div><div class="m_user"></div></div></div>');
	var $msgTpl = $('<div class="clearfix g_line"><span class="u_msg"></span></div>');
	var $menuTpl = $('<ul></ul>');


	function drawRooms(rooms) {
		$el.html("");
		$.each(rooms, function(index, room) {
			var $room = $roomTpl.clone();
			$room.attr("id", "J_gc_" + room.toSafeString());
			$room.find('.u_name').text(room.name);
			$el.append($room);
		});
	}

	function drawRoomDetail(room) {
		var nick = model.detail.personalInfo.nickname || model.self.jid;
		var $room = $("#J_gc_" + room.toSafeString());
		var roomUser = new RoomUser(room.toString() + "/" + nick);
		var $joinBtn = $('<span class="u_btn u_join">加入</span>').button().on("click", function() {
			if ($("#J_gc_dlg_" + room.toSafeString()).length === 0) {
				if (room.passwordprotected) {
					alertify.prompt("请输入房间密码：", function(done, psw) {
						if (done) {
							model.joinedRooms[roomUser.room.toString()] = {
								room: room,
								self: roomUser,
								roomUsers: []
							};
							drawRoomDialog(roomUser);
							Event.trigger("connect/groupchat/joinRoom", [roomUser, psw]);
						}
					});
				} else {
					model.joinedRooms[roomUser.room.toString()] = {
						room: room,
						self: roomUser,
						roomUsers: []
					};
					drawRoomDialog(roomUser);
					Event.trigger("connect/groupchat/joinRoom", [roomUser]);
				}
			}
		});
		var $detailBtn = $('<span class="u_btn u_detail">详情</span>').button().on("click", function() {
			console.log(room);
		});
		$room.prepend($joinBtn).prepend($detailBtn);
	}

	function drawRoomDialog(roomUser) {
		var joinedRoom = model.joinedRooms[roomUser.room.toString()];
		var nick = joinedRoom.self.nickname;
		var room = joinedRoom.room;
		var $roomDlg = $roomDlgTpl.clone();
		$roomDlg.attr("id", "J_gc_dlg_" + room.toSafeString());
		var $roomUsers = $roomDlg.find(".m_user");
		$roomUsers.html("");
		var $textarea = $roomDlg.find("textarea");
		$roomDlg.dialog({
			autoOpen: true,
			closeOnEscape: true,
			closeText: "关闭",
			draggable: true,
			resizable: true,
			width: 600,
			height: 400,
			minHeight: 200,
			minWidth: 300,
			modal: false,
			buttons: [{
				text: "发送",
				click: function() {
					var content = $.trim($textarea.val());
					if (content) {
						Event.trigger("connect/groupchat/message/send", [new GroupChatMessage(roomUser, content, new Date())]);
						$textarea.val("");
					}
				}
			}],
			title: "房间：" + room.name + " —— " + room.description + "（" + nick + "）",
			close: function() {
				leaveRoom(room);
				Event.trigger("connect/groupchat/leaveRoom", [roomUser]);
			}
		});
	}

	function destroyRoomDialog(room) {
		var $room = $("#J_gc_dlg_" + room.toSafeString());
		if ($room.length > 0) {
			$room.dialog("destroy").remove();
		}
	}

	function addRoomUser(roomUser) {
		var room = roomUser.room;
		var $roomUsers = $("#J_gc_dlg_" + room.toSafeString() + " .m_user");
		if ($roomUsers.length > 0) {
			var $user = $("#J_gc_" + roomUser.user.toSafeString());
			var $affi;
			if ($user.length === 0) {
				$user = $('<div class="g_user" data-jid="' + roomUser.toString() + '" id="J_gc_' + roomUser.user.toSafeString() + '"><div>' + roomUser.nickname + '</div></div>');
				$affi = $('<span class="iconfont u_affi u_affi_' + roomUser.affiliation + '">&#xe603;</span>');
				$user.prepend($affi);
				$roomUsers.append($user);
			} else {
				$affi = $('.u_affi', $user);
				$affi.attr("class", "iconfont u_affi u_affi_" + roomUser.affiliation);
			}
		}
	}

	function removeRoomUser(roomUser) {
		$("#J_gc_" + roomUser.user.toSafeString()).remove();
	}

	function drawSubject(room, subject) {
		var $room = $("#J_gc_dlg_" + room.toSafeString());
		if ($room.length > 0) {
			$room.find(".u_subject").text(subject);
		}
	}

	function drawMessage(gcMsg) {
		var roomUser = gcMsg.roomUser;
		var room = roomUser.room;
		var $room = $("#J_gc_dlg_" + room.toSafeString());
		var joinedRoom = model.joinedRooms[room.toString()];
		var $content;
		if ($room.length > 0) {
			var $msg = $msgTpl.clone();
			if (gcMsg.message.type === 'report') {
				var $msgTmp = $('<p><strong>' + roomUser.nickname + ': ' + '</strong><div class="u_chart"></div></p>');
				$msg.find(".u_msg").append($msgTmp).addClass(joinedRoom.self.nickname === roomUser.nickname ? "u_self" : "u_other");;
				$room.find(".m_msg").append($msg);
				Event.trigger('report/draw', [$msg.find('.u_chart').get()[0], gcMsg.message.content]);
			} else {
				$msg.find(".u_msg").html('<p><strong>' + roomUser.nickname + ': ' + '</strong>' + gcMsg.toString() + '</p>').addClass(joinedRoom.self.nickname === roomUser.nickname ? "u_self" : "u_other");
				$room.find(".m_msg").append($msg);
			}
			
		}
	}

	function addUserToModel(roomUser) {
		var users = model.joinedRooms[roomUser.room.toString()].roomUsers;
		for (var i = users.length; i--;) {
			if (users[i].toString() === roomUser.toString()) {
				return users[i] = (roomUser.role || !users[i].role) ? roomUser : users[i];
			}
		}
		users.push(roomUser);
		return roomUser;
	}

	function removeUserFromModel(roomUser) {
		var joinedRoom = model.joinedRooms[roomUser.room.toString()];
		var users = joinedRoom && joinedRoom.roomUsers;
		if (users) {
			for (var i = users.length; i--;) {
				if (users[i].toString() === roomUser.toString()) {
					users.splice(i, 1);
				}
			}
		}
	}

	function findUserFromModel(roomUser) {
		if (typeof roomUser === 'string') {
			roomUser = new RoomUser(roomUser);
		}
		var users = model.joinedRooms[roomUser.room.toString()].roomUsers;
		if (users) {
			for (var i = users.length; i--;) {
				if (users[i].toString() === roomUser.toString()) {
					return users[i];
				}
			}
		}
		return null;
	}

	function drawConfigPanel(self) {
		var room = self.room;
		var $room = $("#J_gc_dlg_" + room.toSafeString());
		var $buttonPanel = $(".ui-dialog-buttonpane", $room.dialog("widget"));
		$(".m_gc_cfg", $buttonPanel).remove();

		var $cfgPanel = $('<div class="m_gc_cfg"></div>');
		$cfgPanel.append('<span class="iconfont u_cfg u_setNick">&#xe603;</span>');
		$cfgPanel.append('<span class="iconfont u_cfg u_sharereport">&#xe60b;</span>');
		$cfgPanel.find(".u_setNick").click(function(event) {
			alertify.prompt("请设置新的昵称：", function(done, nickname) {
				if (done && nickname) {
					Event.trigger("connect/groupchat/changeNickname", [self, nickname]);
				}
			});
		});
		$cfgPanel.find(".u_sharereport").click(function(event) {
			Event.trigger('report/show', [self]);
		});
		$buttonPanel.prepend($cfgPanel);
	}

	function drawAffiPanel(self) {
		var room = self.room;
		if (self.affiliation) {
			var $room = $("#J_gc_dlg_" + room.toSafeString());
			var $menu = $("#J_gc_menu_" + room.toSafeString());
			var exist = false;
			if ($menu.length === 0) {
				$menu = $menuTpl.clone();
				$menu.attr("id", "J_gc_menu_" + room.toSafeString());
				$menu.addClass("g_gc_menu");
				exist = false;
			} else {
				exist = true;
				$menu.html("");
			}

			switch (self.affiliation) {
				case "owner":
					$menu.prepend('<li type="owner">设为所有者</li>');
					$menu.prepend('<li type="admin">设为管理员</li>');
				case "admin":
					$menu.prepend('<li type="member">设为成员</li>');
					$menu.prepend('<li type="none">设为游客</li>');
					$menu.append('<li type="kickout">踢出房间</li>');
					$menu.append('<li type="outcast">加入黑名单</li>');
				case "member":
					break;
				default:
					break;
			}
			if (!exist) {
				$menu.menu().css("z-index", "999999").hide();
				var adjustPosition = function($menu) {
					if ($menu.is(":hidden")) {
						$menu.css({
							left: 0,
							top: 0
						});
					}
				}
				$room.find(".m_user").delegate(".g_user", "click", function(event) {
					var $self = $(this);
					if ($menu.find("li").length > 0) {
						$menu.position({
							my: "left top",
							of: $self,
							collision: "fit"
						}).toggle();
						adjustPosition($menu);
						$menu.data("jid", $self.attr("data-jid"));
					} else {
						$menu.hide();
					}
					event.stopPropagation();
					event.preventDefault();

				});
				$(document).click(function() {
					$menu.hide();
					adjustPosition($menu);
				});
				$menu.delegate("li", "click", function(event) {
					var type = $(this).attr("type");
					if (type === "kickout") {
						alertify.prompt("请输入踢出该用户的原因：", function(done, reason) {
							if (done) {
								Event.trigger("connect/groupchat/kickout", [new RoomUser($menu.data("jid")), reason]);
							}
						});
					} else {
						alertify.prompt("请输入权限变更的原因：", function(done, reason) {
							if (done) {
								Event.trigger("connect/groupchat/setAffiliation", [findUserFromModel($menu.data("jid")), type, reason]);
							}
						});
					}
					event.stopPropagation();
					event.preventDefault();
				});
				$("body").append($menu);
			}
			$menu.find("li").addClass("u_change_affi")
		}
	}

	function leaveRoom(room) {
		delete model.joinedRooms[room.toString()];
		destroyRoomDialog(room);
	}

	Event.on({
		"groupchat/listRoom/fail": function() {
			alertify.error("获取房间列表失败");
		},
		"groupchat/listRoom/success": function(event, rooms) {
			drawRooms(rooms);
			$.each(rooms, function(index, room) {
				Event.trigger("connect/groupchat/getRoomInfo", [room]);
			});
		},
		"groupchat/getRoomInfo/success": function(event, room) {
			model.rooms.push(room);
			drawRoomDetail(room);
		},
		"groupchat/joinRoom/fail": function(event, room) {
			leaveRoom(room);
			alertify.error("加入房间失败...");
		},
		"groupchat/joinRoom/success": function(event, roomUser) {
			//Event.trigger("connect/groupchat/listUsers", roomUser.room);
		},
		"groupchat/presence/available": function(event, roomUser) {
			roomUser = addUserToModel(roomUser);
			addRoomUser(roomUser);
			if (roomUser.nickname === model.joinedRooms[roomUser.room.toString()].self.nickname) {
				model.joinedRooms[roomUser.room.toString()].self = roomUser;
				drawAffiPanel(roomUser);
				drawConfigPanel(roomUser);
			}
		},
		"groupchat/presence/kickout": function(event, roomUser, reason) {
			removeRoomUser(roomUser);
			var joinedRoom = model.joinedRooms[roomUser.room.toString()];
			room = joinedRoom.room;
			if (roomUser.toString() === joinedRoom.self.toString()) {
				alertify.log("您由于“" + reason + "”被“" + room.name + "”房间的管理员踢出了聊天室");
				delete model.joinedRooms[room.toString()];
				destroyRoomDialog(room);
			} else {
				alertify.log("“" + room.name + "”房间的“" + roomUser.nickname + "”由于“" + reason + "”被管理员踢出了聊天室");
			}
		},
		"groupchat/presence/leave": function(event, roomUser) {
			removeUserFromModel(roomUser);
			removeRoomUser(roomUser);
		},
		"groupchat/presence/outcast": function(event, roomUser, reason) {
			removeRoomUser(roomUser);
			var joinedRoom = model.joinedRooms[roomUser.room.toString()];
			room = joinedRoom.room;
			if (roomUser.toString() === joinedRoom.self.toString()) {
				alertify.log("您由于“" + reason + "”被“" + room.name + "”房间的管理员加入黑名单");
				delete model.joinedRooms[room.toString()];
				destroyRoomDialog(room);
			} else {
				alertify.log("“" + room.name + "”房间的“" + roomUser.nickname + "”由于“" + reason + "”被管理员加入黑名单");
			}
		},
		"groupchat/presence/changeNickname": function(event, roomUser, nickname) {
			var room = roomUser.room;
			var joinedRoom = model.joinedRooms[room.toString()];
			removeUserFromModel(roomUser);
			removeRoomUser(roomUser);
			roomUser.nickname = nickname;
			addUserToModel(roomUser);
			addRoomUser(roomUser);
			if (joinedRoom.self.user.toString() === roomUser.user.toString()) {
				joinedRoom.self = roomUser;
			}
		},
		"groupchat/message/receive": function(event, gcMsg) {
			drawMessage(gcMsg);
		},
		"groupchat/subject/receive": function(event, room, subject) {
			drawSubject(room, subject);
		},
		"groupchat/listUsers/fail": function(event, error, room) {
			alertify.error("获取房间用户列表失败");
		},
		"groupchat/listUsers/success": function(event, room, roomUsers) {
			model.joinedRooms[room.toString()].roomUsers = roomUsers;
			$.each(roomUsers, function(index, roomUser) {
				addRoomUser(roomUser);
			});
		},
		"groupchat/kickout/success": function(event, roomUser) {
			alertify.success(roomUser.nickname + "用户被您踢出房间");
		},
		"groupchat/kickout/fail": function(event, error, roomUser) {
			alertify.error("踢出用户" + roomUser.nick + "失败");
		},
		"groupchat/setAffiliation/success": function(event, roomUser) {
			alertify.success("为" + roomUser.nickname + "设置权限成功");
		},
		"groupchat/setAffiliation/fail": function(event, roomUser) {
			alertify.error("为" + roomUser.nickname + "设置权限失败");
		},
		"login/success": function(event, self) {
			Event.trigger("connect/groupchat/listRoom");
		},
		"logout/success": function() {
			$el.html("");
		}
	});
});