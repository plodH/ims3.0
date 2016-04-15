define(function(require, exports, module) {
	var UTIL = require("common/util.js");
	
	exports.serverRoot = 'http://192.168.18.166';
	exports.Resource_UploadURL = "http://imsresource.cleartv.cn/upload";
  	exports.projectName = UTIL.getCookie('project_name');
	// exports.serverRoot = '../../testdata/';

});