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
        // 添加文本按钮点击
        $('#mtr_addLive').click(function () {
            var page = "resources/pages/materials/materials_addLive.html"
            INDEX.coverArea(page);
        })
        // 添加直播按钮点击
        $('#mtr_addLive').click(function () {
            var page = "resources/pages/materials/materials_addLive.html"
            INDEX.coverArea(page);
        })

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
        //搜索
        $('#mtrSearch').bind('input propertychange', function () {
            var typeId = $("#mtrSearch").attr("typeId");
            onSearch($('#mtrSearch').val(), typeId);
        });

        //删除和批量删除
        $("#mtr_delete").click(function () {
            var w = false;
            var MaterialIDs = [];
            for (var x = 0; x < $(".mtr_cb").length; x++) {
                if ($(".mtr_cb:eq(" + x + ")").get(0).checked) {
                    w = true;
                    break;
                }
            }
            if (w) {
                if (confirm("删除资源会删除频道对应的资源,确定删除资源？")) {
                    for (var x = 0; x < $(".mtr_cb").length; x++) {
                        if ($(".mtr_cb:eq(" + x + ")").get(0).checked) {
                            MaterialIDs.push($(".mtr_cb:eq(" + x + ")").attr("mtrID"));
                        }
                    }
                    var pageNum = $(".page.active").find("a").text();
                    var pager = {
                        page: String(pageNum),
                        total: '0',
                        per_page: nDisplayItems,
                        orderby: 'CreateTime',
                        sortby: 'DESC',
                        keyword: keyword
                    };
                    var data = JSON.stringify({
                        action: 'DeleteMulti',
                        project_name: UTIL.getCookie("project_name"),
                        MaterialIDs: MaterialIDs,
                        Pager: pager
                    });
                    var url = CONFIG.serverRoot + '/backend_mgt/v1/materials';
                    UTIL.ajax('post', url, data, function () {
                        var typeId = $("#mtrChoise li.active").attr("typeid");
                        exports.loadPage(pageNum, Number(typeId)); //刷新页面
                    });
                }
            }
        });

        //刷新按钮
        $("#mtr_refresh").click(function () {
            var typeId = $("#mtrChoise li.active").attr("typeid");
            exports.loadPage(1, Number(typeId)); //刷新页面
            $("#cover_area").load(page);
            $("#cover_area").css("display", "flex");
        })

        //编辑
        $("#mtr_edit").click(function () {
            var page = "resources/pages/materials/materials_edit.html"
            INDEX.coverArea(page);
        })

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

    }

    // 加载页面数据
    exports.loadPage = function (pageNum, type) {
        $("#mtrLisTitle").html("");
        $("#mtrTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        var mtrType;
        switch (type) {
            case 1:
                mtrType = "Video";
                $("#mtrLisTitle").html("视频列表");
                $("#mtrSearch").attr("placeholder", "搜索视频");
                $("#mtrSearch").attr("typeId", "1");
                break;
            case 2:
                mtrType = "Image";
                $("#mtrLisTitle").html("图片列表");
                $("#mtrSearch").attr("placeholder", "搜索图片");
                $("#mtrSearch").attr("typeId", "2");
                break;
            case 3:
                mtrType = "Audio";
                $("#mtrLisTitle").html("音频列表");
                $("#mtrSearch").attr("placeholder", "搜索音频");
                $("#mtrSearch").attr("typeId", "3");
                break;
            case 4:
                mtrType = "WebText";
                $("#mtrLisTitle").html("文本列表");
                $("#mtrSearch").attr("placeholder", "搜索文本");
                $("#mtrSearch").attr("typeId", "4");
                break;
            case 5:
                mtrType = "Live";
                $("#mtrLisTitle").html("直播列表");
                $("#mtrSearch").attr("placeholder", "搜索直播");
                $("#mtrSearch").attr("typeId", "5");
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
            visiblePages: CONFIG.pager.visiblePages,
            first: CONFIG.pager.first,
            prev: CONFIG.pager.prev,
            next: CONFIG.pager.next,
            last: CONFIG.pager.last,
            page: CONFIG.pager.page,
            currentPage: Number(json.Pager.page),
            onPageChange: function (num, type) {
                if (type === 'change') {
                    var typeId = $("#mtrChoise li.active").attr("typeid");
                    exports.loadPage(num, Number(typeId));
                }
            }
        });
        //拼接
        if (json.Materials != undefined) {
        	//var mtrkw = json.Pager.keyword;
        	//if (mtrkw == ""){
        	//	$("#mtr_count").html("总数："+json.Pager.total);
        	//}
            var mtrData = json.Materials;
            $("#mtrTable tbody").append('<tr>'+
                                    '<th class="mtr_checkbox"></th>'+
                                    '<th class="mtr_name">文件名</th>'+
                                    '<th class="mtr_size">大小</th>'+
                                    '<th class="mtr_time">时长</th>'+
                                    '<th class="mtr_uploadUser">上传人</th>'+
                                    '<th class="mtr_uploadDate">上传时间</th>'+
                                '</tr>');
            for (var x = 0; x < mtrData.length; x++) {
                var mtrtr = '<tr mtrID="' + mtrData[x].ID + '">' +
                    '<td class="mtr_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrID="' + mtrData[x].ID + '" url="' + mtrData[x].URL + '"></td>' +
                    '<td class="mtr_name"><a href="' + mtrData[x].URL + '" target="_blank">' + mtrData[x].Name + '</a></td>' +
                    '<td class="mtr_size">' + mtrData[x].Size + '</td>' +
                    '<td class="mtr_time">' + mtrData[x].Duration + '</td>' +
                    '<td class="mtr_uploadUser">' + mtrData[x].CreateName + '</td>' +
                    '<td class="mtr_uploadDate">' + mtrData[x].CreateTime + '</td>' +
                    '</tr>';
                $("#mtrTable tbody").append(mtrtr);
            }

        }

        //复选框样式
        $('.mailbox-messages input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue'
        });
        //
        $(".icheckbox_flat-blue").parent().parent().click(function () {
            var obj = $(this).find("input");
            if ($(this).find("input").prop("checked") == true) {
                $(this).find("input").prop("checked", false);
                $(this).find("div").prop("class", "icheckbox_flat-blue");
                $(this).find("div").prop("aria-checked", "false");
            } else {
                $(this).find("input").prop("checked", true);
                $(this).find("div").prop("class", "icheckbox_flat-blue checked");
                $(this).find("div").prop("aria-checked", "true");
            }
            mtrCb();
        })
        //
        $(".icheckbox_flat-blue ins").click(function () {
            mtrCb();
        })
    }

    function onSearch(_keyword, typeId) {
        keyword = typeof(_keyword) === 'string' ? _keyword : '';
        exports.loadPage(1, Number(typeId));
    }

    function mtrChoise(obj) {
        $("#mtrChoise li").attr("class", "");
        obj.parent().attr("class", "active");
    }

    function mtrCb() {
        $("#mtr_delete").removeAttr("disabled");
        var Ck = $(".icheckbox_flat-blue.checked").length;	//当前选中复选框个数
        var Uck = $(".icheckbox_flat-blue").length			//复选框总个数
        if (Ck == 1) {
            var dlurl = $(".icheckbox_flat-blue.checked").find("input").attr("url");
            $("#mtr_view").removeAttr("disabled");
            $("#mtr_download").removeAttr("disabled");
            $("#mtr_edit").removeAttr("disabled");
            $("#mtr_download").parent().attr("href", dlurl);
            $("#mtr_download").parent().attr("download", dlurl);
        } else {
        	if (Ck == 0) {
                $("#mtr_delete").attr("disabled", true);
            }
            $("#mtr_view").attr("disabled", true);
            $("#mtr_download").attr("disabled", true);
            $("#mtr_edit").attr("disabled", true);
            $("#mtr_download").parent().removeAttr("href");
            $("#mtr_download").parent().removeAttr("download");
        }
        //控制全选按钮全选或者不全选状态
        if (Ck == Uck) {
            $(".fa.fa-square-o").attr("class", "fa fa-check-square-o");
        } else {
            $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        }
    }
})
