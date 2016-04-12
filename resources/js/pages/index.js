define(function(require, exports, module) {

	exports.init = function(){
		
		loadPage();

		window.onhashchange = function(){
    		loadPage();
    	}
    	
	}

	function loadPage(){

		var page = window.location.hash.replace(/#/,'');
		if(page == ''){
			page = 'terminal/list';
		}

		// load页面
		$('#page_box').load('resources/pages/'+page+'.html');
	}

});