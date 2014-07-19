detail(function(require, exports, module) {
	var $ = require("jquery");
	var User = require("mods/user");

	var Detail = function(oArgs) {
		if (!(this instanceof Detail)) {
			return new Detail(oArgs);
		}
		this.homeInfo = oArgs.homeInfo;
		this.workInfo = oArgs.workInfo;
		this.personalInfo = oArgs.personalInfo;
		this.avatar = oArgs.avatar;
		this.jid = oArgs.jid;
		this.domain = oArgs.domain;
		this.resource = oArgs.resource;
	};
	$.extend(Detail.prototype, {
		hasHeadPortrait: function() {
			return this.avatar && this.avatar.isExist();
		},
		toUser: function() {
			return new User(this.jid + "@" + this.domain + "/" + this.resource);
		}
	});
});