define(function(require, exports, module) {
	var slice = Array.prototype.slice;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	module.exports = {
		merge: function(dest) {
			var rscs = slice.call(arguments, 1);
			var i, m;
			var rsc;
			var item;
			for (i = 0, m = rscs.length; i < m; i++) {
				rsc = rscs[i];
				for (item in rsc) {
					if (hasOwnProperty.call(rsc, item)) {
						dest[item] = rsc[item];
					}
				}
			}
			return dest;
		}
	};
});