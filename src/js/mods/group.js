define(function(require, exports, module) {
	var $ = require("jquery");

	function Group(name, list) {
		if (!(this instanceof Group)) {
			return new Group(name, list);
		}
		this.name = name;
		this.list = $.isArray(list) ? list : [];
	}
	$.extend(Group.prototype, {
		add: function(user) {
			this.list.push(user);
		},
		index: function(user) {
			var list = this.list;
			for (var i = list.length; i--;) {
				if (list[i].toString() === user.toString()) {
					return i;
				}
			}
			return -1;
		},
		remove: function(user) {
			var self = this;
			var list = self.list;
			var index = self.index(user);
			if (index !== -1) {
				list = list.splice(index, 1);
			}
		},
		count: function() {
			return this.list.length;
		}
	});

	module.exports = Group;
});