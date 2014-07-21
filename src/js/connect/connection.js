define(function(require, exports, module) {
	require("jsjac");
	var config = require("config");
	var Event = require("event");
	var friendPack = require("package/friend");
	var chatPack = require("package/chat");
	var ChatStatus = require("mods/chatstatus");
	var Message = require("mods/message");

	var connectionConfig = {
		httpbase: config.httpbase,
		timerval: config.timerval
	};

	var handler = {
		onIQ: function(aIQ) {
			console.log("handleIQ:" + aIQ.xml());
		},
		onMessage: function(aMessage) {
			if (aMessage.getType() === "groupchat") {
				//TODO: 群聊消息接受
			} else if (aMessage.getType() === "chat") {
				var result = chatPack.parse(aMessage);
				if (result instanceof Message) {
					Event.trigger("message.receive", [result]);
				} else if (result instanceof ChatStatus) {
					Event.trigger("message.status", [result]);
				}
			}
		},
		onPresence: function(presence) {
			presence = friendPack.parsePresence(presence);
			if (presence.type === "available" || presence.type === "unavailable") {
				Event.trigger("friend.presence." + presence.type, [presence.user, presence.show, presence.status]);
			} else {
				Event.trigger("subscribe." + presence.type, [presence.user]);
			}
		},
		onError: function(e) {
			var errorCode = Number($(e).attr("code"));
			if (errorCode >= 400 && errorCode < 500) {
				Event.trigger("connect.login.fail", ["用户名或密码错误"]);
			} else if (errorCode >= 500) {
				Event.trigger("connect.login.fail", ["服务器错误，请联系管理员"]);
			}
		},
		onStatusChanged: function(status) {
			console.log("Status changed : ", status);
		},
		onConnected: function() {
			Event.trigger("connect.login.success");
		},
		onDisconnected: function() {
			Event.trigger("connect.logout");
		},
		onIqVersion: function(iq) {
			connection.send(iq.reply([
				iq.buildNode('name', config.resource),
				iq.buildNode('version', JSJaC.Version),
				iq.buildNode('os', navigator.userAgent)
			]));
		},
		onIqTime: function(iq) {
			var now = new Date();
			connection.send(iq.reply([
				iq.buildNode('display', now.toLocaleString()),
				iq.buildNode('utc', now.jabberDate()),
				iq.buildNode('tz', now.toLocaleString().substring(now.toLocaleString().lastIndexOf(' ') + 1))
			]));
		}
	};

	var connection = config.type === 'binding' ? new JSJaCHttpBindingConnection(connectionConfig) : new JSJaCHttpPollingConnection(connectionConfig);

	connection.registerHandler('message', handler.onMessage);
	connection.registerHandler('presence', handler.onPresence);
	connection.registerHandler('iq', handler.onIQ);
	connection.registerHandler('onconnect', handler.onConnected);
	connection.registerHandler('onerror', handler.onError);
	connection.registerHandler('status_changed', handler.onStatusChanged);
	connection.registerHandler('ondisconnect', handler.onDisconnected);
	connection.registerIQGet('query', NS_VERSION, handler.onIqVersion);
	connection.registerIQGet('query', NS_TIME, handler.onIqTime);

	module.exports = {
		getConnection: function() {
			return connection;
		},
		connect: function(username, password, isRegister) {
			var conConfig = {
				domain: config.domain,
				username: username,
				resource: config.resource,
				pass: password,
				register: isRegister || false,
				host: config.host,
				port: config.port,
				oDbg: console
			};
			connection.connect(conConfig);
		},
		disconnect: function() {
			if (this.isConnecting()) {
				con.disconnect();
			}
		},
		isConnecting: function() {
			return connection && connection.connected();
		}
	};
});