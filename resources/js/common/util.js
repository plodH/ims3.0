define(function(require, exports, module) {

	exports.ajax = function(type, url, data, successFn){
		ajax(type, url, data, successFn);
	};

	exports.getHashParameters = function () {
		var queryString = window.location.hash.match(/\?(.*)/);
		if (queryString === null) {
			return {};
		}
		queryString = queryString[1];
		var pairs = queryString.split('&');
		var ret = {};
		pairs.forEach(function (el, idx, arr) {
			var i = el.indexOf('='), k, v;
			if (i === -1) {
				k = el;
				v = '';
			} else if (i === el.length - 1) {
				k = el.substring(0, el.length - 1);
				v = '';
			} else {
				k = el.substring(0, i);
				v = el.substring(i + 1);
			}
			ret[k] = v;
		});
		return ret;
	};

	function ajax(type, url, data, successFn){

		$.ajax({
		  type: type,
		  url: url,
		  dataType: 'json',
		  data: data,
		  timeout: 3000,
		  success: function(data){
		    successFn(data);
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown){
		  	// XMLHttpRequest.status
		    alert('连接服务器出错: ' + errorThrown);
		  }
		})

	}

});