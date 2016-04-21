define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var templates = require('common/templates');
    var nDisplayItems = 10,
        keyword = "";

    exports.init = function () {
        exports.loadPage(1, 1); //加载默认页面
        //添加
        $("#user_add").click(function () {
            //var page = "resources/pages/materials/materials_edit.html"
            //INDEX.coverArea(page);
			UTIL.cover.load('resources/pages/materials/materials_edit.html');
			//UTIL.cover.close();

        })
    }

    // 加载页面数据
    exports.loadPage = function (pageNum, type) {
        $("#userLisTitle").html("");
        $("#userTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");

        $("#userLisTitle").html("用户列表");
        var data = JSON.stringify({
			project_name: 'newui_dev',
            action: 'GetPage',
            Pager: {
				"total":-1,
				"per_page":10,
				"page":1,
				"orderby":"",
				"sortby":"desc",
				"keyword":""
   			 }
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/roles';
        UTIL.ajax('post', url, data, render);


    }

    function render(json) {
        //翻页
        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
        $('#user-table-pager').jqPaginator({
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
                    exports.loadPage(num, 1);
                }
            }
        });
        //拼接
        if (json.Roles != undefined) {
            var mtrData = json.Roles;
            for (var x = 0; x < mtrData.length; x++) {
                var mtrtr = '<tr userID="' + mtrData[x].RoleID + '">' +
                    '<td class="user_name">' + mtrData[x].RoleName + '</td>' +
                    '<td class="user_id">ID：' + mtrData[x].RoleID + '</td>' + 
					'<td><a class="user_delete">删除</a></td>' +
                    '</tr>';
                $("#userTable tbody").append(mtrtr);
            }
			//删除
			$(".user_delete").click(function () {
				var self = $(this);
				var currentID = self.parent().parent().attr("userID");
				if (confirm("确定删除该角色？")) {
					var data = JSON.stringify({
						project_name: 'newui_dev',
						action: 'Delete'		
					});
					var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + currentID;
					UTIL.ajax('post', url, data, function () {
                        exports.loadPage(1,1); //刷新页面
                    });
				}
        	});
        }
    }
})
