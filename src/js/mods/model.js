define(function(require, exports, module) {
	var $ = require("jquery");
	var self;
	var detail;
	var friends = [];
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
		},
		setDetail: function(detail) {
			this.detail = detail;
		},
		getDetail: function() {
			return this.detail;
		},
		addFriend: function(friend) {
			if ($.isArray(friend)) {
				this.friends = friend;
			} else {
				this.friends.push(friend);
			}
		},
		removeFriend: function(friend) {
			var index = this.friends.indexOf(friend);
			if (index >= 0) {
				this.friends.splice(index, 1);
			}
		},
		toDetailFriend: function(friend) {
			for (var i = this.friends.length; i--;) {
				if (this.friends[i].toString() === friend.toUser.toString()) {
					this.friends[i] = friend;
					break;
				}
			}
		},
		hasFriend: function(user) {
			for (var i = this.friends.length; i--;) {
				if (this.friends[i].toString() === user.toString()) {
					return true;
				}
			}
			return false;
		}
	};
});