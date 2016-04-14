define(function(require, exports, module) {
	var CONFIG = require("common/config.js");
	var UTIL = require("common/util.js");
	
	exports.init = function(){
		loadPage(1);
	}
	
	// 加载页面数据
	function loadPage(pageNum) {
		var pager = {
			page: String(pageNum),
			total: '0',
			per_page: '10',
			orderby: 'CreateTime',
			sortby: 'DESC',
			keyword: ''
		};
		var data = JSON.stringify({
			action: 'GetPage',
			project_name: 'newui_dev',
			material_type: 'Video',
			Pager: pager
		});
		var url = CONFIG.serverRoot + '/backend_mgt/v1/materials';
		UTIL.ajax('post', url, data, render);
	}
	
	function render(data){
		if(data.Materials != undefined)
		{
			var mtrData = data.Materials;
			for(var x=0; x<mtrData.length; x++){
				var mtrli = '<li><input type="checkbox" id="mtr_cb" class="mtr_cb">'+
					'<span class="mtr_name"><nobr>'+mtrData[x].Name+'</nobr></span>'+
					'<span class="mtr_size">大小：'+mtrData[x].Size+'</span>'+
					'<span class="mtr_time">时长：'+mtrData[x].Duration+'</span>'+
					'<span class="mtr_uploadDate">上传时间：'+mtrData[x].CreateTime+'</span>'+
					'</li>';
				$("#mtrList").append(mtrli);
			}

		}


    }

});