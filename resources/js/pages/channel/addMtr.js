define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var nDisplayItems = 10,
        keyword = "";


    exports.init = function () {
        //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });

        //搜索
        $('#mtrChoiseSearch').bind('input propertychange', function () {
            var typeId = $("#mtrChoiseSearch").attr("typeid");
            onSearch($('#mtrChoiseSearch').val(), typeId);
        });

        //下拉框点击事件
        $("#mtr_typeChiose").change(function () {
            var typeId = $("#mtr_typeChiose").val();
            loadPage(1, Number(typeId));
        })
//        
        //全选和全不选
        $(".checkbox-toggle").click(function () {
            var clicks = $(this).data('clicks');

            if (clicks) {
                //Uncheck all checkboxes
                $(".table-responsive input[type='checkbox']").iCheck("uncheck");
                $(".fa", this).removeClass("fa-check-square-o").addClass('fa-square-o');
            } else {
                //Check all checkboxes
                $(".table-responsive input[type='checkbox']").iCheck("check");
                $(".fa", this).removeClass("fa-square-o").addClass('fa-check-square-o');
            }
            $(this).data("clicks", !clicks);
            mtrCb();
        });
        
        var type = $("#mtr_addMtr").attr("typeid");
        loadPage(1, Number(type));

        //保存
        $("#Emtr_updata").click(function () {
            var data;
            for (var x; x < $(".mtr_cb").length; x++) {
                if ($(".mtr_cb:eq(" + x + ")").get(0).checked) {
                    mtrId = $(".mtr_cb:eq(" + x + ")").attr("mtrID")
                    data.push(Number(mtrId));
                }
            }
            exports.getSelectedID(data);
        })
    }

    function loadPage(pageNum, type) {
        //判断是否是视频控件选择列表
        if ($("#mtr_addMtr").attr("typeid") == "1") {
            if (type == 1) {
                $("#dp_action").html("视频");
            } else if (type == 2) {
                $("#mtr_choiseTitle").html("视频控件选择列表");
                $("#dp_action").html("图片");
            }
        } else {
            if (type == 2) {
                $("#mtr_choiseTitle").html("图片控件选择列表");
            }
            $("#mtr_dplist").remove();
        }

        //载入
        var mtrType;
        switch (type) {
            case 1:
                mtrType = "Video";
                $("#mtr_choiseTitle").html("视频控件选择列表");
                $("#mtrChoiseSearch").attr("placeholder", "搜索视频");
                $("#mtrChoiseSearch").attr("typeId", "1");
                break;
            case 2:
                mtrType = "Image";
                $("#mtrChoiseSearch").attr("placeholder", "搜索图片");
                $("#mtrChoiseSearch").attr("typeId", "2");
                break;
            case 3:
                mtrType = "Audio";
                $("#mtr_choiseTitle").html("音频控件选择列表");
                $("#mtrChoiseSearch").attr("placeholder", "搜索音频");
                $("#mtrChoiseSearch").attr("typeId", "3");
                break;
            case 4:
                mtrType = "WebText";
                $("#mtr_choiseTitle").html("文本控件选择列表");
                $("#mtrChoiseSearch").attr("placeholder", "搜索文本");
                $("#mtrChoiseSearch").attr("typeId", "4");
                break;
            case 5:
                mtrType = "Live";
                $("#mtr_choiseTitle").html("直播控件选择列表");
                $("#mtrChoiseSearch").attr("placeholder", "搜索直播");
                $("#mtrChoiseSearch").attr("typeId", "5");
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
            project_name: CONFIG.projectName,
            material_type: mtrType,
            Pager: pager
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v1/materials';
        UTIL.ajax('post', url, data, add);

    }

    //将数据添加到列表
    function add(json) {
        $("#mtr_choiseTable tbody").empty();
        //翻页
//        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
//        totalPages = Math.max(totalPages, 1);
        var totalCounts = Math.max(json.Pager.total, 1);
        $('#materials-table-pager').jqPaginator({
            totalCounts: totalCounts,
            pageSize: nDisplayItems,
            visiblePages: 5,
            first: CONFIG.pager.first,
            prev: CONFIG.pager.prev,
            next: CONFIG.pager.next,
            last: CONFIG.pager.last,
            page: CONFIG.pager.page,
            currentPage: Number(json.Pager.page),
            onPageChange: function (num, type) {
                if (type == 'change') {
                    $('#materials-table-pager').jqPaginator('destroy');
                    var typeId = $("#mtrChoiseSearch").attr("typeid");
                    loadPage(num, Number(typeId));
                }
            }
        });

        //拼接
        if (json.Materials != undefined) {
            var mtrData = json.Materials;
            $("#mtr_choiseTable tbody").append('<tr>' +
                '<th class="mtr_checkbox"></th>' +
                '<th class="mtr_choise_name">文件名</th>' +
                '<th class="mtr_size">大小</th>' +
                '<th class="mtr_time">时长</th>' +
                '<th class="mtr_choise_status">状态</th>' +
                '</tr>');
            if (mtrData.length != 0) {
                var material_type = mtrData[0].Type_Name;
                if (material_type == "文本" || material_type == "Live") {		//文本和直播无预览效果
                    for (var x = 0; x < mtrData.length; x++) {
                        var mtrtr = '<tr mtrID="' + mtrData[x].ID + '">' +
                            '<td class="mtr_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrID="' + mtrData[x].ID + '" url="' + mtrData[x].URL + '"></td>' +
                            '<td class="mtr_choise_name">' + mtrData[x].Name + '</td>' +
                            '<td class="mtr_size">' + mtrData[x].Size + '</td>' +
                            '<td class="mtr_time">00:00:00</td>' +
                            '<th class="mtr_choise_status"><span style="display: none;">已添加</span></th>' +
                            '</tr>';
                        $("#mtr_choiseTable tbody").append(mtrtr);
                    }
                } else {
                    for (var x = 0; x < mtrData.length; x++) {
                        var mtrtr = '<tr mtrID="' + mtrData[x].ID + '">' +
                            '<td class="mtr_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrID="' + mtrData[x].ID + '" url="' + mtrData[x].URL + '"></td>' +
                            '<td class="mtr_choise_name"><a href="' + mtrData[x].URL + '" target="_blank">' + mtrData[x].Name + '</a></td>' +
                            '<td class="mtr_size">' + mtrData[x].Size + '</td>' +
                            '<td class="mtr_time">' + mtrData[x].Duration + '</td>' +
                            '<th class="mtr_choise_status"><span>已添加</span></th>' +
                            '</tr>';
                        $("#mtr_choiseTable tbody").append(mtrtr);
                    }
                }
            }
        }

        //复选框样式
        $('.table-responsive input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue'
        });
        //
        $(".icheckbox_flat-blue").parent().parent().click(function () {
            $(".table-responsive input[type='checkbox']").iCheck("uncheck");
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
        $(".icheckbox_flat-blue ins").click(function () {
            mtrCb();
        })

    }

    //搜索事件
    function onSearch(_keyword, typeId) {
        keyword = typeof(_keyword) === 'string' ? _keyword : '';
        loadPage(1, Number(typeId));
    }

    //校验复选框勾选的个数
    function mtrCb() {
        var Ck = $(".icheckbox_flat-blue.checked").length;	//当前选中复选框个数
        var Uck = $(".icheckbox_flat-blue").length;			//复选框总个数
        //控制全选按钮全选或者不全选状态
        if (Uck != 0) {
            if (Ck == Uck) {
                $(".fa.fa-square-o").attr("class", "fa fa-check-square-o");
            } else {
                $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
            }
        }

    }
})
