define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var MTR = require("pages/materials/materials_list.js");

    var _upl_list = new Array(); //记录上传xhr, status(success, uploading);

    exports.init = function () {
        loadPage();
    }

    function loadPage() {
        //当选择文件后
        if ($("#file")[0].files.length > 0) {
            var fileSize;
            for (var x = 0, y = 1; x < $("#file")[0].files.length; x++, y++) {
                var file = $("#file")[0].files[x];
                var tr = '<tr id="upl_tr_' + x + '" status><td>' + y + '</td><td>' + file.name + '</td>' +
                    '<td><div class="progress progress-xs progress-striped active">' +
                    '<div id="progressbar_' + x + '" class="progress-bar progress-bar-primary" style="width: 0%"></div></div></td>' +
                    '<td id="upl_speed_' + x + '"></td>' +
                    '<td id="upl_status_' + x + '"><a class="upl_cancle">取消上传</td></tr>';
                $("#Tbe_filesList tbody").append(tr);
            }
        }

        //取消上传
        $(".upl_cancle").each(function() {
            $(this).click(function () {
                var i = $(this).parent().parent().index();
                _upl_list[i].xhr.abort();
            })
        })

        //上传按钮点击事件
        $("#BtUpload").click(function () {
            for (var x = 0; x < $("#file")[0].files.length; x++) {
                upload(x);
            }
        });

        //上传模块
        function upload(num) {
            // 上传
            var Qiniu_upload = function (f) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', CONFIG.Resource_UploadURL, true);
                var formData, startDate;
                formData = new FormData();
                formData.append('file', f);
                var taking;
                
                var x = new upl_file(xhr);
                _upl_list.push(x);


                //上传进度
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var nowDate = new Date().getTime();
                        taking = nowDate - startDate;
                        var x = (evt.loaded) / 1024;
                        var y = taking / 1000;
                        var uploadSpeed = (x / y);
                        var formatSpeed;
                        if (uploadSpeed > 1024) {
                            formatSpeed = (uploadSpeed / 1024).toFixed(2)
                                + "Mb\/s";
                        } else {
                            formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
                        }
                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                        //$("#upl_tr_" + num).attr("status", "uploading");
                        $("#progressbar_" + num).css("width", percentComplete + "%");
                        $("#upl_speed_" + num).html(formatSpeed);
                        _upl_list[num].status = 'uploading';
                    }
                }, false);

                
                //入库
                xhr.onreadystatechange = function (response) {
                    var fileName = $("#file")[0].files[num].name;

                    if (xhr.readyState == 4 && xhr.status == 200
                        && xhr.responseText != "") {
                        var blkRet = JSON.parse(xhr.responseText);
                        var material = {};
                        material["project_name"] = UTIL.getCookie("project_name");
                        material["action"] = "Post";
                        material["material"] = {};
                        material["material"]["name"] = fileName;
                        material["material"]["name_eng"] = "";
                        material["material"]["url_name"] = blkRet.upload_path;
                        material["material"]["description"] = "";
                        material["material"]["is_live"] = "0";
                        material["material"]["Download_Auth_Type"] = "None";
                        material["material"]["Download_Auth_Paras"] = "";
                        material["material"]["size"] = blkRet.size;
                        material["material"]["md5"] = blkRet.md5;
                        material["material"]["duration"] = blkRet.duration;
                        material["material"]["create_time"] = getNowFormatDate();
                        // $("#dialog").html(JSON.stringify(material)).dialog();
                        // alert(JSON.stringify(material));
                        $.post(CONFIG.serverRoot + "/backend_mgt/v1/materials",
                            JSON.stringify(material), function (data) {
                                if (parseInt(data.rescode) == 200) {
                                    //$("#upl_tr_" + num).attr("status", "success");
                                    $("#progressbar_" + num).prop("class", "progress-bar progress-bar-success");
                                    $("#upl_speed_" + num).html("");
                                    $("#upl_status_" + num).html("上传成功");
                                    $("#file").prop("value","");
                                    _upl_list[num].status = "success";
                                    MTR.loadPage(1);
                                } else {
                                    //$("#upl_tr_" + num).prop("status", "fail");
                                    $("#progressbar_" + num).prop("class", "progress-bar progress-bar-danger");
                                    $("#upl_status_" + num).html("上传失败");
                                    _upl_list[x].status = 'fail';
                                }
                            }, "json");
                    } else if (xhr.status != 200 && xhr.responseText) {

                    }
                };
                startDate = new Date().getTime();
                xhr.send(formData);
            };
            if ($("#file")[0].files.length > 0) {
                Qiniu_upload($("#file")[0].files[num]);
            } else {
                // console && console.log("form input error");
            }


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

        //最小化上传窗口
        $('#BtMinimize').click(function () {
            $("#page_upload").css("display", "none");
        })

        //关闭上传窗口
        $("#BtClose").click(function () {
            var status = "";
            for(var b = 1; b<$("#Tbe_filesList tr"),length;b++){
                if ($("#Tbe_filesList tr")[b].attr("status") == "uploading") {
                    status = "uploading";
                }
            }
            if (status == 'uploading') {
                if (confirm("有资源正在上传，确定取消上传？")) {
                    //中断所有正在上传内容
                    for( var i = 0; i < _upl_list.length; i++){
                        if( _upl_list[i].status == 'uploading' ){
                            _upl_list[i].xhr.abort();
                        }
                    }
                    //关闭上传窗口
                    closeUpl_list();
                }
            } else {
                //关闭上传窗口
                closeUpl_list();
            }
            function closeUpl_list() {
                for (var i = 1; i < $("#Tbe_filesList tr").length; i++) {
                    $("#Tbe_filesList tr")[i].remove();
                }
                status = "";
                $("#page_upload").css("display", "none");
                $("#file").prop("value","");
            }
        });
    }

    function upl_file(xhr, status) {
        this.xhr = xhr;
        this.status = status;
    }
})
