define(function (require, exports, module) {
	var CONFIG = require("common/config.js");
	var UTIL = require("common/util.js");

    exports.init = function () {

        loadPage();

        window.onhashchange = function () {
            loadPage();
        }

    };

    function loadPage() {

        var page = window.location.hash.match(/^#([^?]*)/);
        page = page === null ? 'terminal/list' : page[1];

        // load页面
        $('#page_box').load('resources/pages/' + page + '.html');

        //登出
        $("#logout").click(function () {
            window.location.href = "login.jsp";
        });
    }
    
    function getCookie(name){
    	var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    	if(arr!=null){
        	return unescape(arr[2]);
        	return null;
     	}
    }
    
//    $(function(){
//    	var json_data = {
//    	        "Project": getCookie("develop"),
//    	        "Action" : "Get"
//    	    }
//    	var url = CONFIG.serverRoot + "/backend_mgt/v1/projects"
//    	UTIL.ajax("get",url,json_data);
//    })
    

});