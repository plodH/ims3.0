define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var INDEX = require("../index.js");

    exports.init = function () {
        exports.loadPage(1);
    }

    // 加载页面数据
    exports.loadPage = function (pageNum) {
        $("#mtrList").html("");
        var pager = {
            page: String(pageNum),
            total: '0',
            per_page: '10',
            orderby: 'CreateTime',
            sortby: 'DESC',
            keyword: ''
        };
        var data = JSON.stringify({
            action: 'GetPage',
            project_name: UTIL.getCookie("project_name"),
            material_type: 'Video',
            Pager: pager
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v1/materials';
        UTIL.ajax('post', url, data, render);

        // 预览操作
        // $("#mtr_view").click(function(){
        // var z_index = parseInt($(this).parent().attr("index"));
        //
        // if(mtrListData[z_index].material_type == 1){
        // var backSuffix =
        // mtrListData[z_index].ftp_path.substring(mtrListData[z_index].ftp_path.lastIndexOf("."));
        // if(backSuffix != ".mp4" && backSuffix != ".ogg" && backSuffix !=
        // ".WebM" && backSuffix != ".MPEG4"){
        // alert("视频格式暂不支持！");
        // return;
        // }
        // }
        // exports.viewData = mtrListData[z_index];
        // blk.Ajax("get","mtr_previewPage",function(msg){
        // $("#coverArea").append(msg);
        // },function(msg){
        // alert(msg);
        // });
        // });

        // 上传文件按钮点击
        $('#mtr_upload').click(function () {
            $('#file').click();
        })

        $("#file").change(function () {
            INDEX.upl();
        });
    }

    function render(data) {
        if (data.Materials != undefined) {
            var mtrData = data.Materials;
            for (var x = 0; x < mtrData.length; x++) {
                var mtrli = '<li><input type="checkbox" id="mtr_cb" class="mtr_cb">'
                    + '<span class="mtr_name"><nobr>'
                    + mtrData[x].Name
                    + '</nobr></span>'
                    + '<span class="mtr_size">大小：'
                    + mtrData[x].Size
                    + '</span>'
                    + '<span class="mtr_time">时长：'
                    + mtrData[x].Duration
                    + '</span>'
                    + '<span class="mtr_uploadDate">上传时间：'
                    + mtrData[x].CreateTime + '</span>' + '</li>';
                $("#mtrList").append(mtrli);
            }

        }

    }

});