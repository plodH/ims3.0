define(function (require, exports, module) {
	var CONFIG = require("common/config.js");
	var UTIL = require("common/util.js");

    exports.init = function () {

        loadPage(null);

        window.onhashchange = function () {
        	var page = window.location.hash.match(/^#([^?]*)/);
            loadPage(page);
        }
        
        //选择资源
        $("#treeview_mtr").click(function () {
        	$(".sidebar-menu li").attr("class","treeview");
        	$(".sidebar-menu li ul").css("display","none");
        	$("#treeview_mtr").attr("class","active");
        	var page = window.location.hash.match(/^#([^?]*)/);
            loadPage(page);
        })
        //选择布局
        $("#treeview_layout").click(function () {
        	$(".sidebar-menu li").attr("class","treeview");
        	$(".sidebar-menu li ul").css("display","none");
        	$("#treeview_layout").attr("class","active");
        	var page = window.location.hash.match(/^#([^?]*)/);
            loadPage(page);
        })

    };
    //上传弹层页面
    exports.upl = function(){
        $("#page_upload").load('resources/pages/materials/materials_upload.html');
        $("#page_upload").css("display","flex");
    }

    function loadPage(page) {
    	$("#menu_termlist").trigger("click");
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
//    			"Project": "",
//		        "Action" : "Get"
//    	    }
//    	var url = CONFIG.serverRoot + "/backend_mgt/v1/projects"
//    	UTIL.ajax("post", url, json_data, render);
//    })
    
    function render(data){
    	var proData = data.Projects;
    }
});