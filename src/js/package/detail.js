define(function(require, exports, module) {
	var $ = require("jquery");
	var HomeInfo = require("mods/homeinfo");
	var WorkInfo = require("mods/workinfo");
	var PersonalInfo = require("mods/personalinfo");
	var Detail = require("mods/detail");
	var Avatar = require("mods/avatar");
	var detailFrame = {
		withPhoto: '<vCard xmlns="vcard-temp"><N><FAMILY/><GIVEN/><MIDDLE/></N><ORG><ORGNAME/><ORGUNIT/></ORG><FN/><URL/><TITLE/><NICKNAME/><PHOTO><BINVAL></BINVAL><TYPE></TYPE></PHOTO><EMAIL><HOME/><INTERNET/><PREF/><USERID/></EMAIL><TEL><PAGER/><WORK/><NUMBER/></TEL><TEL><CELL/><WORK/><NUMBER/></TEL><TEL><VOICE/><WORK/><NUMBER/></TEL><TEL><FAX/><WORK/><NUMBER/></TEL><TEL><PAGER/><HOME/><NUMBER/></TEL><TEL><CELL/><HOME/><NUMBER/></TEL><TEL><VOICE/><HOME/><NUMBER/></TEL><TEL><FAX/><HOME/><NUMBER/></TEL><ADR><WORK/><PCODE/><REGION/><STREET/><CTRY/><LOCALITY/></ADR><ADR><HOME/><PCODE/><REGION/><STREET/><CTRY/><LOCALITY/></ADR></vCard>',
		noPhoto: '<vCard xmlns="vcard-temp"><N><FAMILY/><GIVEN/><MIDDLE/></N><ORG><ORGNAME/><ORGUNIT/></ORG><FN/><URL/><TITLE/><NICKNAME/><EMAIL><HOME/><INTERNET/><PREF/><USERID/></EMAIL><TEL><PAGER/><WORK/><NUMBER/></TEL><TEL><CELL/><WORK/><NUMBER/></TEL><TEL><VOICE/><WORK/><NUMBER/></TEL><TEL><FAX/><WORK/><NUMBER/></TEL><TEL><PAGER/><HOME/><NUMBER/></TEL><TEL><CELL/><HOME/><NUMBER/></TEL><TEL><VOICE/><HOME/><NUMBER/></TEL><TEL><FAX/><HOME/><NUMBER/></TEL><ADR><WORK/><PCODE/><REGION/><STREET/><CTRY/><LOCALITY/></ADR><ADR><HOME/><PCODE/><REGION/><STREET/><CTRY/><LOCALITY/></ADR></vCard>',
	};
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
		setSelf: function(detail) {
			var aIQ = new JSJaCIQ();
			aIQ.setType("set");

			var result;
			if (detail.hasAvatar()) {
				result = (new DOMParser()).parseFromString(detailFrame.withPhoto, "text/xml");
				result.querySelector("PHOTO TYPE").appendChild(result.createTextNode(detail.avatar.type));
				result.querySelector("PHOTO BINVAL").appendChild(result.createTextNode(detail.avatar.binval));
			} else {
				result = (new DOMParser()).parseFromString(detailFrame.noPhoto, "text/xml");
			}

			$("N FAMILY", result).text(detail.personalInfo.familyName);
			$("N GIVEN", result).text(detail.personalInfo.name);
			$("N MIDDLE", result).text(detail.personalInfo.middleName);
			$("ORG ORGNAME", result).text(detail.workInfo.company);
			$("ORG ORGUNIT", result).text(detail.workInfo.department);
			$("FN", result).text(detail.personalInfo.name + " " + detail.personalInfo.middleName + " " + detail.personalInfo.familyName);
			$("URL", result).text(detail.workInfo.webSite);
			$("TITLE", result).text(detail.workInfo.title);
			$("NICKNAME", result).text(detail.personalInfo.nickname);
			$("EMAIL USERID", result).text(detail.personalInfo.email);
			$("TEL", result).each(function() {
				var that = $(this),
					info;
				if ($("WORK", that).length !== 0) {
					info = detail.workInfo;
				} else {
					info = detail.homeInfo;
				}
				if ($("PAGER", that).length !== 0) {
					$("NUMBER", that).text(info.bleeper);
				}
				if ($("CELL", that).length !== 0) {
					$("NUMBER", that).text(info.telephone);
				}
				if ($("VOICE", that).length !== 0) {
					$("NUMBER", that).text(info.phone);
				}
				if ($("FAX", that).length !== 0) {
					$("NUMBER", that).text(info.fax);
				}
			});
			$("ADR", result).each(function() {
				var that = $(this),
					info;
				if ($("WORK", that).length !== 0) {
					info = detail.workInfo;
				} else {
					info = detail.homeInfo;
				}
				$("PCODE", that).text(info.postCode);
				$("REGION", that).text(info.province);
				$("STREET", that).text(info.street);
				$("CTRY", that).text(info.country);
				$("LOCALITY", that).text(info.city);
			});
			aIQ.appendNode(result.childNodes[0]);
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