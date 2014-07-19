define(function(require, exports, module) {
	var $ = require("jquery");

	var Avatar = function(oArgs) {
		if (!(this instanceof Avatar)) {
			return new Avatar(oArgs);
		}
		this.type = oArgs.type;
		this.binval = oArgs.binval;
	};
	$.extend(Avatar.prototype, {
		toHtmlString: function() {
			return 'data:' + this.type + ';base64,' + this.binval;
		},
		isExist: function() {
			return !!this.binval;
		}
	});
	module.exports = Avatar;
});