define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");

    exports.init = function () {
        window.onhashchange = function () {
            loadPage();
        }

        //选择资源
        $("#treeview_mtr").click(function () {
            $(".sidebar-menu li").attr("class", "treeview");
            $(".sidebar-menu li ul").css("display", "none");
            $("#treeview_mtr").attr("class", "treeview active");
            loadPage();
        })

        loadPage();
    };
    //上传弹层页面
    exports.upl = function () {
        $("#page_upload").load('resources/pages/materials/materials_upload.html');
        $("#page_upload").css("display", "flex");
    }

    function loadPage() {
        var page = window.location.hash.match(/^#([^?]*)/);
        page = page === null ? 'terminal/list' : page[1];
        
        //刷新菜单的焦点
        $(".sidebar-menu li").attr("class", "treeview");
        $(".sidebar-menu li ul li").removeAttr("class");
        $(".sidebar-menu").find("a").each(function () {
            if (page != null) {
                var activeHref = "#" + page;
                if ($(this).attr("href") == activeHref) {
                    if($(this).parent().attr("class") == null){					//二级菜单
                    	$(this).parent().attr("class", "active");
                    	$(this).parent().parent().parent().attr("class", "treeview active");
                    }else if ($(this).parent().attr("class") == "treeview"){	//一级菜单
                    	$(this).parent().attr("class", "treeview active");
                    }
                }
            }
        })
        // load页面
        $('#page_box').load('resources/pages/' + page + '.html');

        //登出
        $("#logout").click(function () {
            window.location.href = "login.jsp";
        });
    }

//    $(function(){
//    	var json_data = {
//    			"Project": "",
//		        "Action" : "Get"
//    	    }
//    	var url = CONFIG.serverRoot + "/backend_mgt/v1/projects"
//    	UTIL.ajax("post", url, json_data, render);
//    })

    function render(data) {
        var proData = data.Projects;
    }
});