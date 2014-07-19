define(function(require, exports, module) {
	var Address = function(oArgs) {
		if (!(this instanceof Address)) {
			return new Address(oArgs);
		}
		this.city = oArgs.city;
		this.province = oArgs.province;
		this.postCode = oArgs.postCode;
		this.country = oArgs.country;
		this.phone = oArgs.phone;
		this.fax = oArgs.fax;
		this.bleeper = oArgs.bleeper;
		this.telephone = oArgs.telephone;
	};
	module.exports = Address;
});