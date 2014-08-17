define(function(require, exports, module) {
	var rRoom = /([\w\-\u4e00-\u9fa5]+)@([\w\-]+)\.([\w-.]+)/;
	var $ = require("jquery");

	function Room(jid, name, detail) {

		var self = this;
		if (!(self instanceof Room)) {
			return new Room(jid, name, detail);
		}
		var rst = rRoom.exec(jid);
		if (!rst) {
			return null;
		}
		self.roomId = rst[1];
		self.resource = rst[2];
		self.domain = rst[3];
		self.name = name;
		if (detail) {
			$.extend(self, detail);
		}
	}

	$.extend(Room.prototype, {
		toString: function() {
			return this.roomId + '@' + this.resource + '.' + this.domain;
		},
		toSafeString: function() {
			return this.roomId + "_" + this.resource + "_" + this.domain;
		}
	});
	module.exports = Room;
});