define(function(require, exports, module) {
	var config = require("config");
	var Room = require("mods/room");

	module.exports = {
		listRoom: function() {
			var aIQ = new JSJaCIQ();
			aIQ.setTo(config.groupchat + "." + config.domain).setType("get");
			aIQ.setQuery(NS_DISCO_ITEMS);
			return aIQ;
		},
		parseRoom: function(aIQ) {
			var rooms = [];
			$("item", aIQ.xml()).each(function(index, node) {
				node = $(node);
				rooms.push(new Room(node.attr("jid"), node.attr("name")));
			});
			return rooms;
		}
	};
});