define(function(require, exports, module) {
	var User = require("mods/user");
	var Room = require("mods/room");
	var rRoomJid = /(.*)\/(.*)/;

	function RoomUser(roomJid, user, affiliation, role) {
		if (!(this instanceof RoomUser)) {
			return new RoomUser(roomJid, user, affiliation, role);
		}
		var regRst = rRoomJid.exec(roomJid);
		this.room = new Room(regRst[1]);
		this.nickname = regRst[2];
		this.user = user && typeof user === 'string' ? new User(user) : user;
		this.affiliation = affiliation;
		this.role = role;
	}

	$.extend(RoomUser.prototype, {
		toString: function() {
			return this.room.toString() + "/" + this.nickname;
		},
		toSafeString: function() {
			return this.room.toSafeString() + "_" + this.nickname
		}
	});

	module.exports = RoomUser;
});