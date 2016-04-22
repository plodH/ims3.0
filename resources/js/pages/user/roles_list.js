define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var templates = require('common/templates');
    var nDisplayItems = 10,
        keyword = "";

    exports.init = function () {
        exports.loadPage(1, 1); //加载默认页面
        //添加
        $("#roles_add").click(function () {
            //var page = "resources/pages/materials/materials_edit.html"
            //INDEX.coverArea(page);
			UTIL.cover.load('resources/pages/user/roles_add.html');
        })
    }

    // 加载页面数据
    exports.loadPage = function (pageNum, type) {
        $("#rolesLisTitle").html("");
        $("#rolesTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        $("#rolesLisTitle").html("角色列表");
        var data = JSON.stringify({
			project_name: 'newui_dev',
            action: 'GetPage',
            Pager: {
				"total":-1,
				"per_page":10,
				"page":pageNum,
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
        $('#roles-table-pager').jqPaginator({
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
					$('#roles-table-pager').jqPaginator('destroy');
					exports.loadPage(num, 1);
                }
            }
        });
        //拼接
        if (json.Roles != undefined) {
            var rolData = json.Roles;
            for (var x = 0; x < rolData.length; x++) {
				//var stringArry;
				var rID = rolData[x].RoleID;
				var users = rolData[x].Users;
//				var data = JSON.stringify({
//					project_name: 'newui_dev',
//					action: 'GetUsers',
//					Pager: {
//						"total":-1,
//						"per_page":10,
//						"page":1,
//						"orderby":"",
//						"sortby":"desc",
//						"keyword":""
//					 }
//				});
				//var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
//				UTIL.ajax('post', url, data, function(cbdata){
//					var nameArry = [];
//					var users = cbdata.Users;		
//					for(var i=0;i<users.length;i++){
//						nameArry[i] = users[i].USERNAME;
//						}	
//					stringArry = nameArry.join();	
//					//alert(stringArry);				
//					});
					
				//alert(stringArry);
                var roltr = '<tr rolesID="' + rolData[x].RoleID + '">' +
                    '<td class="roles_name"><a class="role_name">' + rolData[x].RoleName + '</a></td>' +
                    '<td class="roles_id">ID：' + rolData[x].RoleID + '</td>' + 
					'<td class="users" style="width:300px;overflow:hidden;text-overflow:ellipsis;">' + users + '</td>' + 
					'<td><a class="roles_delete">删除</a></td>' +
					'<td><a class="roles_assign">分配用户</a></td>' +
                    '</tr>';
                $("#rolesTable tbody").append(roltr);
            }
			//删除
			$(".roles_delete").click(function () {
				var self = $(this);
				var currentID = self.parent().parent().attr("rolesID");
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
			//编辑
			$(".role_name").click(function(){
				var self = $(this);
				var rName = self.html();
				var currentID = self.parent().parent().attr("rolesID");
				exports.roleName = rName;
				exports.roleID = currentID;
				UTIL.cover.load('resources/pages/user/roles_edit.html');
				});
			//分配用户
			$(".roles_assign").click(function(){
				var self = $(this);
				var userList = self.parent().prev().prev().html();
				exports.uList = userList;
				UTIL.cover.load('resources/pages/user/roles_assign.html');
				});
        }
    }
})
