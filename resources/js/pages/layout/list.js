'use strict';

define(function(require, exports, module) {
	
	var templates = require('common/templates'),
		config = require('common/config'),
        util = require('common/util');
		
	exports.init = function() {
        console.log(util.getHashParameters());
	};
	
});
