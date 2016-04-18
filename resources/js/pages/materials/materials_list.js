define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var INDEX = require("../index.js");
    var MTRU = require("pages/materials/materials_upload.js");
    var templates = require('common/templates');
    var nDisplayItems = 10,
        keyword = "";

    exports.init = function () {
        exports.loadPage(1, 1); //加载默认页面
        // 上传文件按钮点击
        $('#mtr_upload').click(function () {
            $('#file').trigger("click");
        })
        $("#file").change(function () {
            if ($("#page_upload").children().length == 0) {
                INDEX.upl();
            } else {
                $("#page_upload").css("display", "block");
                $("#upload_box").css("display", "block");
                MTRU.beginUpload();
            }

        });

        //加载视频列表
        $('#mtrVideo').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 1);
        })
        //加载图片列表
        $('#mtrImage').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 2);
        })
        //加载音频列表
        $('#mtrAudio').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 3);
        })
        //加载文本列表
        $('#mtrText').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 4);
        })
        //加载直播列表
        $('#mtrLive').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 5);
        })

        $('#mtrSearch').bind('input propertychange', function() {
            //searchProductClassbyName();
            var typeId = $("#mtrSearch").attr("typeId");
            onSearch($('#mtrSearch').val(),typeId);
        });
        //$("#mtrSearch").change(function(){
        //	var typeId = $("#mtrSearch").attr("typeId");
        //    onSearch($('#mtrSearch').val(),typeId);
        //})

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
    }

    // 加载页面数据
    exports.loadPage = function (pageNum, type) {
        $("#mtrLisTitle").html("");
        $("#mtrTable tbody").html("");
        var mtrType;
        switch (type) {
            case 1:
                mtrType = "Video";
                $("#mtrLisTitle").html("视频列表");
                $("#mtrSearch").attr("placeholder","搜索视频");
                $("#mtrSearch").attr("typeId","1");
                break;
            case 2:
                mtrType = "Image";
                $("#mtrLisTitle").html("图片列表");
                $("#mtrSearch").attr("placeholder","搜索图片");
                $("#mtrSearch").attr("typeId","2");
                break;
            case 3:
                mtrType = "Audio";
                $("#mtrLisTitle").html("音频列表");
                $("#mtrSearch").attr("placeholder","搜索音频");
                $("#mtrSearch").attr("typeId","3");
                break;
            case 4:
                mtrType = "WebText";
                $("#mtrLisTitle").html("文本列表");
                $("#mtrSearch").attr("placeholder","搜索文本");
                $("#mtrSearch").attr("typeId","4");
                break;
            case 5:
                mtrType = "Live";
                $("#mtrLisTitle").html("直播列表");
                $("#mtrSearch").attr("placeholder","搜索直播");
                $("#mtrSearch").attr("typeId","5");
                break;
        }
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
        UTIL.ajax('post', url, data, render);
    }

    function render(json) {
        //翻页
        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
        $('#materials-table-pager').jqPaginator({
            totalPages: totalPages,
            visiblePages: 10,
            currentPage: Number(json.Pager.page),
            onPageChange: function (num, type) {
                if (type === 'change') {
                    loadPage(num);
                }
            }
        });

        if (json.Materials != undefined) {
            var mtrData = json.Materials;
            for (var x = 0; x < mtrData.length; x++) {
                var mtrtr = '<tr>' +
                    '<td><input type="checkbox" id="mtr_cb" class="mtr_cb"></td>' +
                    '<td class="mtr_name">' + mtrData[x].Name + '</td>' +
                    '<td class="mtr_size">大小：' + mtrData[x].Size + '</td>' +
                    '<td class="mtr_time">时长：' + mtrData[x].Duration + '</td>' +
                    '<td class="mtr_uploadUser">上传人：' + mtrData[x].CreateName + '</td>' +
                    '<td class="mtr_uploadDate">上传时间：' + mtrData[x].CreateTime + '</td>' +
                    '</tr>';
                $("#mtrTable tbody").append(mtrtr);
            }

        }

        //复选框
        //复选框样式
        $('.mailbox-messages input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue'
        });
        //全选和全不选
        $(".checkbox-toggle").click(function () {
            var clicks = $(this).data('clicks');
            if (clicks) {
                //Uncheck all checkboxes
                $(".mailbox-messages input[type='checkbox']").iCheck("uncheck");
                $(".fa", this).removeClass("fa-check-square-o").addClass('fa-square-o');
            } else {
                //Check all checkboxes
                $(".mailbox-messages input[type='checkbox']").iCheck("check");
                $(".fa", this).removeClass("fa-square-o").addClass('fa-check-square-o');
            }
            $(this).data("clicks", !clicks);
        });

        $(".mtr_cb").click(function(){

        })

    }

    function onSearch(_keyword,typeId) {
        keyword = typeof(_keyword) === 'string' ? _keyword : '';
        exports.loadPage(1, Number(typeId));
    }

    function mtrChoise(obj) {
        $("#mtrChoise li").attr("class", "");
        obj.parent().attr("class", "active");
        
    }

});