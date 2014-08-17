define(function(require, exports, module) {
	var $ = require("jquery");

	function Model() {
		this.self;
		this.detail;
		this.status;
		this.friends;
		this.groups;
		this.nicks;
		this.history;
		this.reset();
	}

	$.extend(Model.prototype, {
		set: function(propName, value) {
			var self = this;
			self[propName] = value;
		},
		get: function(propName) {
			var self = this;
			return self[propName];
		},
		reset: function() {
			this.self = null;
			this.detail = null;
			this.status = null;
			this.friends = [];
			this.groups = {};
			this.nicks = {};
			this.history = {};
			this.rooms = [];
			this.joinedRooms = {};
		}
	});

	module.exports = new Model();
});