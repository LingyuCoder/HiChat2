define(function(require, exports, module) {
	var $ = require("jquery");
	var EventHandler = $(document);

	module.exports = {
		on: function() {
			EventHandler.on.apply(EventHandler, arguments);
		},
		off: function() {
			EventHandler.off.apply(EventHandler, arguments);
		},
		trigger: function() {
			EventHandler.trigger.apply(EventHandler, arguments);
		},
	};
});