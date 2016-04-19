define(function(require, exports, module) {

  var TREE = require("common/treetree.js");
  var CONFIG = require("common/config.js");
  var UTIL = require("common/util.js");
  var _timerLoadTermList;
  var _pagesize = CONFIG.pager.pageSize;
  var _pageNO = 1;

	exports.init = function(){
    initTree();
	}

  function loadTermList(){
    
    if(_timerLoadTermList){
      clearInterval(_timerLoadTermList);
    }

    if($('#termclass-tree').length > 0){
      _timerLoadTermList = setInterval(function(){loadTermList()}, CONFIG.termListLoadInterval);
    }
    else{
      return;
    }
    
    // loadlist start
    var searchKeyword = $.trim($('#term_search').val());
    
    var status = 0;
    var bp = $('#term_status').find('.btn-primary');
    if(bp.length > 0){
      status = bp.attr('code');
    }

    var termClassId = $('#termclass-tree').find('.focus').attr('node-id');

    var data = {
      "project_name": CONFIG.projectName,
      "action": "getTermList",
      "categoryID": termClassId,
      "Pager":{
        "total": -1,
        "per_page": _pagesize,
        "page": _pageNO,
        "orderby": "",
        "sortby": "desc",
        "keyword": searchKeyword
      }
    }

    UTIL.ajax(
      'POST', 
      CONFIG.serverRoot + '/backend_mgt/v2/termcategory',
      JSON.stringify(data), 
      function(data){
        if(data.rescode != 200){
          alert('获取终端列表出错：'+rescode.errInfo);
          return;
        }
        // set pagebar

        try{
          $('#term-table-pager').jqPaginator('destroy');
        }catch(error){
          console.error("$('#term-table-pager').jqPaginator 未创建");
        }
        
        var totalCounts = Math.max(data.totalStatistic.totalTermNum, 1);

        $('#term-table-pager').jqPaginator({
          totalCounts: totalCounts,
          pageSize: _pagesize,
          visiblePages: CONFIG.pager.visiblePages,
          first: CONFIG.pager.first,
          prev: CONFIG.pager.prev,
          next: CONFIG.pager.next,
          last: CONFIG.pager.last,
          page: CONFIG.pager.page,
          currentPage: _pageNO,
          onPageChange: function (num, type) {
            _pageNO = num;
            if (type === 'change') {
             loadTermList();
            }
          }
        });

        // term_download_status
        $('#term_download_status').html(' 下载（' + data.totalStatistic.downloadFileNum + '/' + data.totalStatistic.downloadAllFileNum + '） 预下载（' + data.totalStatistic.preDownloadFileNum + '/' + data.totalStatistic.preDownloadAllFileNum + '）');
      
        // term_online_status
        $('#term_online_1').html(data.totalStatistic.onlineTermNum + '/' + data.totalStatistic.totalTermNum);

        // term_list
        var tl = data.termList.terms;
        $('#term_list').empty();
        for(var i = 0; i < tl.length; i++){

          var downloadStatus = JSON.parse(tl[i].CurrentChannelDownloadInfo);
          var downloadNum = downloadStatus.DownloadFiles +'/' + downloadStatus.AllFiles;
          downloadStatus = downloadStatus.DownloadFiles/downloadStatus.AllFiles*100;

          var preloadStatus = JSON.parse(tl[i].PreDownloadInfo);
          var preloadNum = preloadStatus.DownloadFiles +'/' + preloadStatus.AllFiles;
          preloadStatus = preloadStatus.DownloadFiles/preloadStatus.AllFiles*100;

          $('#term_list').append('' +
            '<tr tid='+ tl[i].ID +'>' +
              '<td><input type="checkbox"></td>' +
              '<td>'+ tl[i].Name +'<br />'+ tl[i].Description +'<br />'+ tl[i].Status +'</td>' +
              '<td>当前频道：'+ ((tl[i].CurrentPlayInfo==='')?'':JSON.parse(tl[i].CurrentPlayInfo).ChannelName) +'<br />当前节目：'+ ((tl[i].CurrentPlayInfo==='')?'':JSON.parse(tl[i].CurrentPlayInfo).ProgramName) +'<br />当前视频：'+ ((tl[i].CurrentPlayInfo==='')?'':JSON.parse(tl[i].CurrentPlayInfo).ProgramPlayInfo) +
              '</td>' +
              '<td>' +
                '<span style="font-size: 12px; color: grey;">下载：'+downloadNum+'</span>' +
                '<div style="height: 10px; margin-top: 0px;" class="progress progress-striped">' +
                   '<div class="progress-bar progress-bar-success" role="progressbar" ' +
                      'aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" ' +
                      'style="width: '+ downloadStatus +'%;">' +
                      '<span class="sr-only">'+ downloadStatus +'% 完成（成功）</span>' +
                   '</div>' +
                '</div>' +
                '<span style="font-size: 12px; color: grey;">预下载：'+preloadNum+'</span>' +
                '<div style="height: 10px; margin-top: 0px;" class="progress progress-striped">' +
                   '<div class="progress-bar progress-bar-success" role="progressbar" ' +
                      'aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" ' +
                      'style="width: '+ preloadStatus +'%;">' +
                      '<span class="sr-only">'+ preloadStatus +'% 完成（成功）</span>' +
                   '</div>' +
                '</div>' +
              '</td>' +
              '<td>' +
              'ip：192.123.22.12<br />' +
              '版本信息' +
              '</td>' +
              '<td><a class="pointer">编辑</a> <br/><a class="pointer">截屏</a></td>' +
            '</tr>'
          )
        }  
      }
    )
  }

  function initTree(){

    var dataParameter = {
      "project_name": CONFIG.projectName,
      "action": "getTree"
    };

    UTIL.ajax(
      'POST', 
      CONFIG.serverRoot+'/backend_mgt/v2/termcategory', 
      JSON.stringify(dataParameter),
      function(data){
        if(data.rescode === '200'){
          data = data.TermTree.children;
          var tree = {domId: 'termclass-tree', canCheck: false};
          tree = TREE.new(tree);
          tree.createTree($('#'+tree.domId), data);
          // alert('loadtermlist: '+$('#termclass-tree').find('.focus').attr('node-id'))
          loadTermList();

          // 终端分类列表各项点击
          $('#termclass-tree li > a').each(function(i, e){
            $(this).click(function(e){
              tree.setFocus($(this).parent());
               // alert('loadtermlist: '+$(this).parent().attr('node-id'))
               loadTermList();
            })
          })

          // 添加终端分类按钮点击
          $('#tct_add').click(function(){
            var li = $('#termclass-tree').find('.focus');

            // 如果正在有添加中，不相应
            if(li.children('a').find('div input').length > 0){
              return;
            }

            var newNode = [
              {
                "children": [], 
                "id": "", 
                "name": "未命名终端分类"
              }
            ]
            // 如果分类有子分类
            var ul;
            if(li.hasClass('treeview')){
              ul = li.children('ul');
            }
            // 如果分类下无子分类
            else{
              tree.addParentCss(li);
              ul = $('<ul class="tree-menu-2"></ul>');
              li.append(ul);
            }
            tree.createNode(ul, newNode);
            var dom = ul.children('li:nth('+(ul.children().length-1)+')');
            tree.openNode(li);
            tree.setFocus(dom);
            // alert('loadtermlist: '+dom.attr('node-id'));
            loadTermList();
            tree.showEditInput(dom,function(input){
              input.blur(function(e){
                addTermClassName(input);
              })
            });
            
            function addTermClassName(input){
              var change = $.trim(input.val());
              var a = input.parent().parent();
              var t = a.children('span');
              
              // 终端组分类名称为空时设置名称为：未命名终端分类
              if(change === ''){
                change = '未命名终端分类';
              }

              // 提交终端组分类名称新建
              var parentId = input.parent().parent().parent().parent().parent().attr('node-id');
              var data = {
                "project_name": CONFIG.projectName,
                "action": "addCategory",
                "parentCategoryID": Number(parentId),
                "name": change
              }

              UTIL.ajax(
                'POST', 
                CONFIG.serverRoot + '/backend_mgt/v2/termcategory',
                JSON.stringify(data), 
                function(data){
                  var a = $('#termclass-tree').find('.focus').children('a');
                  var input = a.children('div').children('input');
                  var t = a.children('span');
                  var li = a.parent();
                  if(data.rescode == '200'){
                    t.html(' ' + $.trim(input.val()));
                    t.css('display','inline-block');
                    input.parent().remove();
                    li.attr('node-id',data.categoryID);
                    a.click(function(e){
                      tree.setFocus(li);
                      // alert('loadtermlist: '+li.attr('node-id'));
                      loadTermList();
                    })
                  }else{
                    alert('新建终端分类失败');
                    input.focus();
                  }
                }
              );
            }

          })

          // 删除终端分类按钮点击
          $('#tct_delete').click(function(){
            var focus = $('#termclass-tree').find('.focus');

            // 不能删除“全部”
            if(focus.attr('node-id') == 1){
              alert('不能删除根目录');
            }else{
              if(confirm('确定删除终端分类"' + $.trim(focus.children('a').find('span').html()) + '"? （该分类下的终端不会被删除）')){
                if(confirm('请再次确认，确定删除终端分类"' + $.trim(focus.children('a').find('span').html()) + '"? （该分类下的终端不会被删除）')){

                  var nodeId = focus.attr('node-id');
                  var data = {
                    "project_name": CONFIG.projectName,
                    "action": "delCategory",
                    "categoryID": Number(nodeId)
                  }

                  UTIL.ajax(
                    'POST', 
                    CONFIG.serverRoot + '/backend_mgt/v2/termcategory',
                    JSON.stringify(data), 
                    function(data){
                      if(data.rescode == '200'){
                        var focus = $('#termclass-tree').find('.focus');
                        tree.setFocus(focus.parent().parent());
                        // alert('loadtermlist: '+focus.parent().parent().attr('node-id'));
                        loadTermList();
                        focus.remove();
                      }else{
                        alert('删除终端分类失败');
                        input.focus();
                      }
                    }
                  );
                }
              }
            }

          })

          // 编辑终端分类按钮点击
          $('#tct_edit').click(function(){
            var p = $('#termclass-tree').find('.focus');

            tree.showEditInput(p,function(input){
              input.blur(function(e){
                editTermClassName(input);
              })
            });

            function editTermClassName(input){
              var change = $.trim(input.val());
              var a = input.parent().parent();
              var t = a.children('span');
              
              // 终端组分类名称为空时恢复原名称，不提交修改
              if(change === ''){
                t.css('display','inline-block');
                input.parent().remove();
              }

              // 终端组分类名称未改变时不提交修改
              else if( change ===  $.trim(t.html()) ){
                t.css('display','inline-block');
                input.parent().remove();
              }

              // 提交终端组分类名称修改
              else{
                var nodeId = a.parent().attr('node-id');
                var data = {
                  "project_name": CONFIG.projectName,
                  "action": "changeCategoryName",
                  "categoryID": nodeId,
                  "newName": change
                }

                UTIL.ajax(
                  'POST', 
                  CONFIG.serverRoot + '/backend_mgt/v2/termcategory',
                  JSON.stringify(data), 
                  function(data){
                    var a = $('#termclass-tree').find('.focus').children('a');
                    var input = a.children('div').children('input');
                    var t = a.children('span');
                    if(data.rescode == '200'){
                      t.html(' ' + $.trim(input.val()));
                      t.css('display','inline-block');
                      input.parent().remove();
                    }else{
                      alert('编辑终端分类失败');
                      input.focus();
                    }
                  }
                );
              }
            }

          })

        }else{
          alert('获取终端分类失败');
        }
      }
    );

    /*var tree = {domId: 'termclass-tree', canCheck: false};
    tree = TREE.new(tree);
    var data = [
        {
            "children": [
                {
                    "id": 2, 
                    "name": "未分类终端",
                    "children": []
                }, 
                {
                    "children": [
                        {
                            "children": [
                                {
                                    "id": 316, 
                                    "name": "自定义分类1-1-1",
                                    "children": []
                                }
                            ], 
                            "id": 313, 
                            "name": "自定义分类1-1"
                        }, 
                        {
                            "id": 314, 
                            "name": "自定义分类1-2",
                            "children": []
                        }
                    ], 
                    "id": 310, 
                    "name": "自定义分类1"
                }, 
                {
                    "children": [
                        {
                            "id": 315, 
                            "name": "自定义分类2-1",
                            "children": []
                        }
                    ], 
                    "id": 311, 
                    "name": "自定义分类2"
                }, 
                {
                    "id": 312, 
                    "name": "自定义分类3",
                    "children": []
                }
            ], 
            "id": 1, 
            "name": "全部终端"
        },
        {
            "children": [
                {
                    "id": 2, 
                    "name": "未分类终端",
                    "children": []
                }, 
                {
                    "children": [
                        {
                            "children": [
                                {
                                    "id": 316, 
                                    "name": "自定义分类1-1-1",
                                    "children": []
                                }
                            ], 
                            "id": 313, 
                            "name": "自定义分类1-1"
                        }, 
                        {
                            "id": 314, 
                            "name": "自定义分类1-2",
                            "children": []
                        }
                    ], 
                    "id": 310, 
                    "name": "自定义分类1"
                }, 
                {
                    "children": [
                        {
                            "id": 315, 
                            "name": "自定义分类2-1",
                            "children": []
                        }
                    ], 
                    "id": 311, 
                    "name": "自定义分类2"
                }, 
                {
                    "id": 312, 
                    "name": "自定义分类3",
                    "children": []
                }
            ], 
            "id": 1, 
            "name": "全部终端"
        }
    ]
    tree.createTree($('#'+tree.domId), data);
    */

    // $('.treetree li .fa-angle-left').each(function(i, e){
    //   $(this).click(function(e){
    //     alert(1)
    //   })
    // })

    // $('.treetree li').each(function(i, e){
    //   $(this).click(function(e){
    //     e.preventDefault();
    //     e.stopPropagation();
    //   })
    // })
  }

});