define(function(require, exports, module) {
	var $ = require("jquery");
	var HomeInfo = require("mods/homeinfo");
	var WorkInfo = require("mods/workinfo");
	var PersonalInfo = require("mods/personalinfo");
	var Detail = require("mods/detail");
	var Avatar = require("mods/avatar");

	module.exports = {
		getSelf: function() {
			var aIQ = new JSJaCIQ(),
				aVCardNode = aIQ.buildNode("vCard", {
					"xmlns": NS_VCARD
				});
			aIQ.setType("get");
			aIQ.appendNode(aVCardNode);
			return aIQ;
		},
		getOther: function(user) {
			var aIQ = new JSJaCIQ(),
				aVCardNode = aIQ.buildNode("vCard", {
					"xmlns": NS_VCARD
				});
			aIQ.setType("get");
			aIQ.setTo(user.toString());
			aIQ.appendNode(aVCardNode);
			return aIQ;
		},
		parse: function(detail) {
			var homeInfo,
				workInfo,
				personalInfo,
				avatar,
				info;
			detail = $($(detail.xml()).get()[0]);

			personalInfo = new PersonalInfo({
				name: $("N GIVEN", detail).text(),
				middleName: $("N MIDDLE", detail).text(),
				familyName: $("N FAMILY", detail).text(),
				nickname: $("NICKNAME", detail).text(),
				email: $("EMAIL USERID", detail).text()
			});
			homeInfo = new HomeInfo({});
			workInfo = new WorkInfo({
				company: $("ORG ORGNAME", detail).text(),
				department: $("ORG ORGUNIT", detail).text(),
				title: $("TITLE", detail).text(),
				webSite: $("URL", detail).text()
			});
			$("TEL", detail).each(function() {
				var that = $(this),
					info;
				if ($("WORK", that).length !== 0) {
					info = workInfo;
				} else {
					info = homeInfo;
				}
				if ($("PAGER", that).length !== 0) {
					info.bleeper = $("NUMBER", that).text();
				}
				if ($("CELL", that).length !== 0) {
					info.telephone = $("NUMBER", that).text();
				}
				if ($("VOICE", that).length !== 0) {
					info.phone = $("NUMBER", that).text();
				}
				if ($("FAX", that).length !== 0) {
					info.fax = $("NUMBER", that).text();
				}
			});
			$("ADR", detail).each(function() {
				var that = $(this),
					info;
				if ($("WORK", that).length !== 0) {
					info = workInfo;
				} else {
					info = homeInfo;
				}
				info.postCode = $("PCODE", that).text();
				info.province = $("REGION", that).text();
				info.street = $("STREET", that).text();
				info.country = $("CTRY", that).text();
				info.city = $("LOCALITY", that).text();
			});

			avatar = new Avatar({
				type: $("PHOTO TYPE", detail).text(),
				binval: $("PHOTO BINVAL", detail).text()
			});
			detail = new Detail({
				homeInfo: homeInfo,
				workInfo: workInfo,
				personalInfo: personalInfo,
				avatar: avatar
			});
			return detail;
		}
	};
});