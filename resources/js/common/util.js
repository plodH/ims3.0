define(function(require, exports, module) {

	exports.ajax = function(type, url, data, successFn){
		ajax(type, url, data, successFn);
	}

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