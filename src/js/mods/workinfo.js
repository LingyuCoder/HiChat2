define(function(require, exports, module) {
	var Address = require("mods/address");
	var $ = require("jquery");

	var WorkInfo = function(oArgs) {
		if (!(this instanceof WorkInfo)) {
			return new WorkInfo(oArgs);
		}
		$.extend(this, new Address(oArgs));
		this.company = oArgs.company;
		this.title = oArgs.title;
		this.department = oArgs.department;
		this.webSite = oArgs.webSite;
	};
	module.exports = WorkInfo;
});