define(function(require, exports, module) {
	var Address = require("mods/address");
	var $ = require("jquery");

	var HomeInfo = function(oArgs) {
		if (!(this instanceof HomeInfo)) {
			return new HomeInfo(oArgs);
		}
		$.extend(this, new Address(oArgs));
	};
	module.exports = HomeInfo;
});