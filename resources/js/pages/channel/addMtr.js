define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var MTR = require("pages/materials/materials_list.js");


    exports.init = function () {
    	//关闭窗口
        $(".CA_close").click(function () {
        	UTIL.cover.close();
        });
    	
//        var mtrId;
//        for (var x = 0; x < $(".mtr_cb").length; x++) {
//            if ($(".mtr_cb:eq(" + x + ")").get(0).checked) {
//                mtrId = $(".mtr_cb:eq(" + x + ")").attr("mtrID");
//            }
//        }
        loadPage();

        //保存
        $("#Emtr_updata").click(function () {
        	var mtrName = $("#Emtr_name").val() + "." + $("#Emtr_name").attr("mtrtype");
            var material = {
                Name: mtrName
            }
            var data = JSON.stringify({
                action: 'Put',
                project_name: UTIL.getCookie("project_name"),
                Data: material
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v1/materials/';
            UTIL.ajax('post', url, data, function(msg){
                if(msg.rescode == 200){
                    var typeId = $("#mtrChoise li.active").attr("typeid");
                    MTR.loadPage(1, Number(typeId));
                    UTIL.cover.close();
                	alert("修改成功");
                }else{
                	alert("修改失败");
                }
            });
        })
    }

    function loadPage(pageNum) {
        //载入
    	var pager = {
                page: String(pageNum),
                total: '0',
                per_page: nDisplayItems,
                orderby: 'CreateTime',
                sortby: 'DESC',
                keyword: keyword
            };
            var data = JSON.stringify({
                action: 'GetPage',
                project_name: UTIL.getCookie("project_name"),
                material_type: mtrType,
                Pager: pager
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v1/materials';
            UTIL.ajax('post', url, data, add);

    }

    //将数据添加到列表
    function add(json) {
    	//翻页
        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
        $('#materials-table-pager').jqPaginator({
            totalPages: totalPages,
            visiblePages: CONFIG.pager.visiblePages,
            first: CONFIG.pager.first,
            prev: CONFIG.pager.prev,
            next: CONFIG.pager.next,
            last: CONFIG.pager.last,
            page: CONFIG.pager.page,
            currentPage: Number(json.Pager.page),
            onPageChange: function (num, type) {
                if (type === 'change') {
                	$('#term-table-pager').jqPaginator('destroy');
                    exports.loadPage(num);
                }
            }
        });
    }
})
