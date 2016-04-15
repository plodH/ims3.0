define(function(require, exports, module) {

	
  var UTIL = require("common/util.js");

  exports.projectName = UTIL.getCookie('project_name');
  exports.serverRoot = 'http://192.168.18.166';
	// exports.serverRoot = '../../testdata/';

});