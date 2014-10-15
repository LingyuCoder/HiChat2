define(function(require, exports, module) {
	var config = require("config");

	var Room = require("../mods/room");
	var RoomUser = require("../mods/roomuser");
	var GroupchatMessage = require("../mods/groupchatmessage");

	var rMucFeature = /muc_(.*)/;

	var rMucField = /muc#roominfo_(.*)/;

	module.exports = {
		listRoom: function() {
			var aIQ = new JSJaCIQ();
			aIQ.setTo(config.groupchat + "." + config.domain).setType("get").setQuery(NS_DISCO_ITEMS);
			return aIQ;
		},
		parseRoom: function(aIQ) {
			var rooms = [];
			$("item", aIQ.xml()).each(function(index, node) {
				node = $(node);
				rooms.push(new Room(node.attr("jid"), node.attr("name")));
			});
			return rooms;
		},
		getRoomInfo: function(room) {
			var aIQ = new JSJaCIQ();
			aIQ.setTo(room.toString()).setType('get').setQuery(NS_DISCO_INFO);
			return aIQ;
		},
		parseRoomInfo: function(roomInfo) {
			var $roomInfo = $(roomInfo.xml());
			var detail = {};
			$.each($("feature", $roomInfo), function(index, feature) {
				var $feature = $(feature);
				var regRst = $feature.attr('var').match(rMucFeature);
				if (regRst) {
					detail[regRst[1]] = true;
				}

			});
			$.each($("field", $roomInfo), function(index, field) {
				var $field = $(field);
				var regRst = $field.attr('var').match(rMucField);
				if (regRst) {
					detail[regRst[1]] = $field.text();
				}
			});
			var room = new Room($roomInfo.attr("from"), $("identity", $roomInfo).attr("name"), detail);
			return room;
		},
		"joinRoom": function(roomUser, password) {
			var aPresence = new JSJaCPresence(),
				xNode = aPresence.buildNode("x", {
					"xmlns": NS_MUC
				}),
				passwordNode;
			aPresence.setTo(roomUser.room.toString() + '/' + roomUser.nickname);
			aPresence.appendNode(xNode);
			if (typeof password === 'string') {
				passwordNode = aPresence.buildNode("password");
				passwordNode.appendChild(document.createTextNode(password));
				xNode.appendChild(passwordNode);
			}
			return aPresence;
		},
		"parsePresence": function(aPresence) {
			var $presence = $(aPresence.xml());
			var status = $("status", $presence);
			var destroy = $("destroy", $presence);
			var roomUser;
			var $item;
			$item = $presence.find("item");
			console.log(aPresence.xml());
			var roomUser = new RoomUser($presence.attr("from"),
				$item.attr("jid"),
				$item.attr("affiliation"),
				$item.attr("role"));
			if ($presence.attr("type") === 'unavailable') {
				if (status.length !== 0) {
					//被踢出
					if (status.attr("code") === "307") {
						return {
							type: "kickout",
							roomUser: roomUser,
							reason: $("reason", $presence).text()
						};
					}
					//被加入黑名单
					if (status.attr("code") === "301") {
						return {
							type: "outcast",
							roomUser: roomUser,
							reason: $("reason", $presence).text()
						};
					}
					//改变昵称
					if (status.attr("code") === "303") {
						return {
							type: "changeNickname",
							roomUser: roomUser,
							nickname: $item.attr("nick")
						};
					}
				} else if (destroy.length !== 0) {
					//房间被删除
					return {
						type: "deleteRoom",
						room: roomUser.room,
						reason: $("reason", $presence).text()
					};
				}
				//用户离开
				return {
					type: "leave",
					roomUser: roomUser
				};
			} else {
				//新用户
				return {
					type: "available",
					roomUser: roomUser
				};
			}
		},
		"leaveRoom": function(roomUser) {
			var aPresence = new JSJaCPresence(),
				statusNode;
			aPresence.setTo(roomUser.room.toString()).setType("unavailable");
			return aPresence;
		},
		"sendMessage": function(roomUser, message) {
			var aMessage = new JSJaCMessage();
			var bodyNode = aMessage.buildNode("body");
			aMessage.setTo(roomUser.room.toString()).setType("groupchat");
			bodyNode.appendChild(document.createTextNode(message));
			aMessage.appendNode(bodyNode);
			return aMessage;
		},
		"parseMessage": function(aMessage) {
			var $message = $(aMessage.xml());
			var $subject = $message.find("subject");
			var time = $message.find("delay");
			var from = $message.attr("from");
			if (time.length > 0) {
				time = new Date();
			} else {
				time = new Date(time.attr("stamp"));
			}
			if ($subject.length > 0) {
				return {
					type: "subject",
					subject: $subject.text(),
					room: new Room(from)
				};
			} else {
				return {
					type: "message",
					message: new GroupchatMessage(from, aMessage.getBody(), time)
				};
			}
		},
		"listUsers": function(room) {
			var aIQ = new JSJaCIQ();
			var queryNode = aIQ.setTo(room.toString()).setType("get").setQuery(NS_DISCO_ITEMS);
			return aIQ;
		},
		"parseUsers": function(users) {
			var $users = $(users.xml());
			var roomUsers = [];
			$.each($users.find("item"), function(index, $user) {
				$user = $($user);
				roomUsers.push(new RoomUser($user.attr("jid")));
			});
			return roomUsers;
		},
		"kickout": function(roomUser, reason) {
			var aIQ = new JSJaCIQ(),
				queryNode,
				itemNode,
				reasonNode;
			aIQ.setTo(roomUser.room.toString()).setType("set");
			queryNode = aIQ.setQuery(NS_MUC_ADMIN);
			itemNode = aIQ.buildNode("item");
			itemNode.setAttribute("nick", roomUser.nickname);
			itemNode.setAttribute("role", "none");
			if (reason) {
				reasonNode = aIQ.buildNode("reason");
				reasonNode.appendChild(document.createTextNode(reason));
				itemNode.appendChild(reasonNode);
			}
			queryNode.appendChild(itemNode);
			return aIQ;
		},
		"setAffiliation": function(roomUser, affiliation, reason) {
			var aIQ = new JSJaCIQ(),
				queryNode,
				itemNode;
			aIQ.setTo(roomUser.room.toString()).setType("set");
			queryNode = aIQ.setQuery(NS_MUC_ADMIN);
			itemNode = aIQ.buildNode("item");
			itemNode.setAttribute("affiliation", affiliation);
			itemNode.setAttribute("jid", roomUser.user.toString());
			queryNode.appendChild(itemNode);
			return aIQ;
		},
		"changeNickname": function(roomUser, nickname) {
			var aPresence = new JSJaCPresence();
			aPresence.setTo(roomUser.room.toString() + "/" + nickname);
			return aPresence;
		}
	};
});