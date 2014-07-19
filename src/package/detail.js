define(["jsjac"], function(require, exports, module) {
	var $ = require("jquery");
	var Detail = require("mods/detail");
	var Avatar = require("mods/avatar");
	var HomeInfo = require("mods/homeinfo");
	var WorkInfo = require("mods/workinfo");
	var PersonalInfo = require("mods/personalinfo");

	module.exports = {
		createSelf: function() {
			var aIQ = new JSJaCIQ(),
				aVCardNode = aIQ.buildNode("vCard", {
					"xmlns": NS_VCARD
				});
			aIQ.setType("get");
			aIQ.appendNode(aVCardNode);
			return aIQ;
		},
		createOther: function(user) {
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
				headPortrait,
				info;
			detail = $(detail);
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
					info.setBleeper($("NUMBER", that).text());
				}
				if ($("CELL", that).length !== 0) {
					info.setTelephone($("NUMBER", that).text());
				}
				if ($("VOICE", that).length !== 0) {
					info.setPhone($("NUMBER", that).text());
				}
				if ($("FAX", that).length !== 0) {
					info.setFax($("NUMBER", that).text());
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
				info.setPostCode($("PCODE", that).text());
				info.setProvince($("REGION", that).text());
				info.setStreet($("STREET", that).text());
				info.setCountry($("CTRY", that).text());
				info.setCity($("LOCALITY", that).text());
			});

			headPortrait = new HeadPortrait({
				type: $("PHOTO TYPE", detail).text(),
				binval: $("PHOTO BINVAL", detail).text()
			});
			detail = new Detail({
				homeInfo: homeInfo,
				workInfo: workInfo,
				personalInfo: personalInfo,
				headPortrait: headPortrait
			});
			return detail;
		}
	};
});