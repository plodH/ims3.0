define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
	var ROLES = require("pages/user/roles_list.js");
	var templates = require('common/templates');
    var nDisplayItems = 10;


    exports.init = function () {
				
		exports.loadUserPage(1); //加载默认页面
		//确定
		$("#users_updata").click(function(){
			var checked_id = $(".assign");
			var cUser = [];
			for(var i=0;i<checked_id;i++){
				cUser[i]=checked_id[i];
				alert(cUser[i]);
				}
			})
		 //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });
    }
	 // 加载页面数据
    exports.loadUserPage = function (pageNum) {
        $("#usersTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        var data = JSON.stringify({
			project_name: 'newui_dev',
            action: 'GetUsersAll',
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
        $('#users-table-pager').jqPaginator({
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
					exports.loadUserPage(num);
                }
            }
        });
        //拼接
        if (json.Users != undefined) {
            var rolData = json.Users;
			//当前角色已绑定的用户
			var userList = ROLES.uList;
			var uArry = userList.split(",");
            for (var i = 0; i < rolData.length; i++) {	
				var userName = rolData[i].USERNAME;
				var userID = rolData[i].ID;
				var hasUser = false;	
				for(var x=0;x<uArry.length;x++){
					   if(uArry[x]==userName){
						   hasUser = true; 
						   break;
						   }	 
			   	   };
				   if(hasUser == true){
					  var roltr = '<tr userID="' + rolData[i].ID + '">' +
						  '<td class="user_checkbox"><input type="checkbox" checked="checked" disabled="true" userID="' + rolData[i].ID + '"></td>' +
						  '<td class="user_name">' + rolData[i].USERNAME + '</td>' +
						  '<td class="user_id">ID：' + rolData[i].ID + '</td>' + 
						  '</tr>';
					  $("#usersTable tbody").append(roltr);
				   }else{
					   var roltr = '<tr class="assign" userID="' + rolData[i].ID + '">' +
						  '<td class="user_checkbox"><input type="checkbox" userID="' + rolData[i].ID + '"></td>' +
						  '<td class="user_name">' + rolData[i].USERNAME + '</td>' +
						  '<td class="user_id">ID：' + rolData[i].ID + '</td>' + 
						  '</tr>';
					  $("#usersTable tbody").append(roltr);
				 }		
                
            }
        }
		 //复选框样式
        $('.mailbox-messages input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue'
        });
    }
})
