define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var MTR = require("pages/materials/materials_list.js");


    exports.init = function () {
        loadPage();

        //保存
        $("#ULmtr_add").click(function () {
        	var mtrName = $("#ULmtr_name").val();
            var mtrUrl = $("#ULmtr_address").val();
            var material = {
                name: mtrName,
                name_eng: '',
                url_name: mtrUrl,
                description: '',
                is_live: '1',
                Download_Auth_Type: 'None',
                Download_Auth_Paras: '',
                size: '0',
                md5: '',
                duration: '0',
                create_time: getNowFormatDate()
            };
            var data = JSON.stringify({
                action: 'Post',
                project_name: UTIL.getCookie("project_name"),
                material: material,
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v1/materials';
            UTIL.ajax('post', url, data, function(msg){
                if(msg.rescode == 200){
                    var typeId = $("#mtrChoise li.active").attr("typeid");
                    MTR.loadPage(1, Number(typeId));
                    close();
                    alert("添加成功");
                }else{
                    alert("添加失败");
                }
            });
        })
    }

    function loadPage() {
        //关闭窗口
        $(".CA_close").click(function () {
            close();
        });
    }

    //关闭窗口
    function close() {
        $("#cover_area").html("");
        $("#cover_area").css("display", "none");
    }

    //获取当前时间
    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        var strHour = date.getHours();
        var strMin = date.getMinutes();
        var strSec = date.getSeconds();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        if (strHour >= 0 && strHour <= 9) {
            strHour = "0" + strHour;
        }
        if (strMin >= 0 && strMin <= 9) {
            strMin = "0" + strMin;
        }
        if (strSec >= 0 && strSec <= 9) {
            strSec = "0" + strSec;
        }
        var currentdate = date.getFullYear() + seperator1 + month
            + seperator1 + strDate + " " + strHour + seperator2
            + strMin + seperator2 + strSec;
        return currentdate;
    }
})
