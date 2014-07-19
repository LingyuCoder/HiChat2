define(function(require, exports, module) {
	var self;
	module.exports = {
		setSelf: function(usr) {
			if (typeof self === "string") {
				var User = require("mods/user");
				usr = new User(usr);
			}
			self = usr;
		},
		getSelf: function() {
			return self;
		}
	};
});