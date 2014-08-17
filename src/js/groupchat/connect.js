define(function(require, exports, module) {
	var Event = require("event");
	var connection = require("connection").getConnection();
	
	var groupchatPack = require("./pack");

	Event.on({
		"connect/groupchat/listRoom": function() {
			connection.sendIQ(groupchatPack.listRoom(), {
				error_handler: function(error) {
					Event.trigger("groupchat/listRoom/fail", [error]);
				},
				result_handler: function(rooms) {
					var rooms = groupchatPack.parseRoom(rooms);
					Event.trigger("groupchat/listRoom/success", [rooms]);
				}
			});
		},
		"connect/groupchat/getRoomInfo": function(event, room) {
			connection.sendIQ(groupchatPack.getRoomInfo(room), {
				error_handler: function(error) {
					Event.trigger("groupchat/getRoomInfo/fail", [error]);
				},
				result_handler: function(roomInfo) {
					var room = groupchatPack.parseRoomInfo(roomInfo);
					Event.trigger("groupchat/getRoomInfo/success", [room]);
				}
			});
		},
		"connect/groupchat/joinRoom": function(event, roomUser, password) {
			connection.send(groupchatPack.joinRoom(roomUser, password), function(roomSelf) {
				if ($(roomSelf.xml()).find("error").length > 0) {
					Event.trigger("groupchat/joinRoom/fail", [roomUser.room]);
				} else {
					Event.trigger("groupchat/joinRoom/success", [roomUser]);
					Event.trigger("connect/groupchat/presence/receive", [roomSelf]);
				}
			});
		},
		"connect/groupchat/presence/receive": function(event, presence) {
			console.log(presence.xml());
			presence = groupchatPack.parsePresence(presence);
			var type = presence.type;
			if (type === "available") {
				Event.trigger("groupchat/presence/available", [presence.roomUser]);
			} else if (type === "kickout") {
				Event.trigger("groupchat/presence/kickout", [presence.roomUser, presence.reason]);
			} else if (type === "outcast") {
				Event.trigger("groupchat/presence/outcast", [presence.roomUser, presence.reason]);
			} else if (type === "changeNickname") {
				Event.trigger("groupchat/presence/changeNickname", [presence.roomUser, presence.nickname]);
			} else if (type === "deleteRoom") {
				//TODO: 房间删除
			} else if (type === "leave") {
				Event.trigger("groupchat/presence/leave", [presence.roomUser]);
			}
		},
		"connect/groupchat/leaveRoom": function(event, roomUser) {
			connection.send(groupchatPack.leaveRoom(roomUser));
		},
		"connect/groupchat/message/send": function(event, roomUser, message) {
			connection.send(groupchatPack.sendMessage(roomUser, message));
		},
		"connect/groupchat/message/receive": function(event, aMessage) {
			var message = groupchatPack.parseMessage(aMessage);
			if (message.type === "subject") {
				Event.trigger("groupchat/subject/receive", [message.room, message.subject]);
			} else {
				Event.trigger("groupchat/message/receive", [message.message]);
			}
		},
		"connect/groupchat/listUsers": function(event, room) {
			connection.sendIQ(groupchatPack.listUsers(room), {
				error_handler: function(error) {
					Event.trigger("groupchat/listUsers/fail", [error, room]);
				},
				result_handler: function(users) {
					Event.trigger("groupchat/listUsers/success", [room, groupchatPack.parseUsers(users)]);
				}
			});
		},
		"connect/groupchat/kickout": function(event, roomUser, reason) {
			connection.sendIQ(groupchatPack.kickout(roomUser, reason), {
				error_handler: function(error) {
					Event.trigger("groupchat/kickout/fail", [error, roomUser]);
				},
				result_handler: function(aJSJaCPacket) {
					Event.trigger("groupchat/kickout/success", [roomUser]);
				}
			});
		},
		"connect/groupchat/setAffiliation": function(event, roomUser, affiliation, reason) {
			connection.sendIQ(groupchatPack.setAffiliation(roomUser, affiliation, reason), {
				error_handler: function(error) {
					Event.trigger("groupchat/setAffiliation/fail", [error, roomUser, affiliation]);
				},
				result_handler: function(aJSJaCPacket) {
					Event.trigger("groupchat/setAffiliation/success", [roomUser, affiliation]);
				}
			});
		},
		"connect/groupchat/changeNickname": function(event, self, nickname) {
			connection.send(groupchatPack.changeNickname(self, nickname));
		}
	});
});