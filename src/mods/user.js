define(function(require, exports, module) {
	var r_user = /([\w\-\u4e00-\u9fa5]+)@([\w\-.]+)(?:\/([\w-]+))?/;
	var $ = require("jquery");
	var User = function(jid) {
		var regResult;

		if (!this instanceof User) {
			return new User(jid);
		}
		if (!(regResult = r_user.exec(jid))) {
			return null;
		}
		this.jid = regResult[1];
		this.domain = regResult[2];
		this.resource = regResult[3];
	};
	$.extend(User.prototype, {
		toFullString: function() {
			return this.jid + "@" + this.domain + "/" + this.resource;
		},
		toString: function() {
			return this.jid + "@" + this.domain;
		}
	});
	module.exports = User;
});