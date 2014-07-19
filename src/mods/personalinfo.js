define(function(require, exports, module) {
	var PersonInfo = function(oArgs) {
		if (!(this instanceof PersonInfo)) {
			return new PersonInfo(oArgs);
		}
		this.name = oArgs.name;
		this.middleName = oArgs.middleName;
		this.familyName = oArgs.familyName;
		this.nickname = oArgs.nickname;
		this.email = oArgs.email;
	};
	module.exports = PersonInfo;
});