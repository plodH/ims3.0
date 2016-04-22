define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
	var ROLES = require("pages/user/roles_list.js");


    exports.init = function () {
		var rName = ROLES.roleName;
		var rID = ROLES.roleID;
		$("#role_name").val(rName);
        //修改角色名
        $("#name_change").click(function () {
        	var roleName = $("#role_name").val();
            var name = {
                RoleName: roleName
            }
            var data = JSON.stringify({
                project_name: 'newui_dev',
                action:'Put',
                Data: name
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
            UTIL.ajax('post', url, data, function(msg){
                if(msg.rescode == 200){
					UTIL.cover.close();         
                	alert("修改成功");
                }else{
                	alert("修改失败");
                }	
				ROLES.loadPage(1, 1);			
            });
        });
		//获取角色的功能模块及读写权限
		
		 //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });
    }
})
