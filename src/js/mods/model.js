define(function(require, exports, module) {
	var $ = require("jquery");

	function Model() {
		this.self;
		this.detail;
		this.status;
		this.friends;
		this.groups;
		this.nicks;
	}

	$.extend(Model.prototype, {
		set: function(propName, value) {
			var self = this;
			self[propName] = value;
		},
		get: function(propName) {
			var self = this;
			return self[propName];
		}
	});

	module.exports = new Model();
});