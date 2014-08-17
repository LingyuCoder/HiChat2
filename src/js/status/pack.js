define(function(require, exports, module) {
	module.exports = {
		sendStatus: function(status) {
			var aPresence = new JSJaCPresence(),
				showNode = aPresence.buildNode("show");
			showNode.appendChild(document.createTextNode(status));
			aPresence.appendNode(showNode);
			return aPresence;
		}
	};
});