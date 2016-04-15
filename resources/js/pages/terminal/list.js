define(function(require, exports, module) {

  var TREE = require("common/treetree.js");
  var CONFIG = require("common/config.js");
  var UTIL = require("common/util.js");

	exports.init = function(){
    initTree();
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

          // 终端分类列表各项点击
          $('#termclass-tree li > a').each(function(i, e){
            $(this).click(function(e){
              tree.setFocus($(this).parent());
               alert($(this).parent().attr('node-id'))
            })
          })

          // 添加终端分类按钮点击
          $('#tct_add').click(function(){
            var li = $('#termclass-tree').find('.focus');
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
              ul = $('<ul class="tree-menu-2"></ul>');
              li.append(ul);
            }
            tree.createNode(ul, newNode);
            var dom = ul.children('li:nth('+(ul.children().length-1)+')');
            tree.openNode(li);
            tree.setFocus(dom);
            tree.showEditInput(dom);
            
          })

          // 编辑终端分类按钮点击
          $('#tct_edit').click(function(){
            var p = $('#termclass-tree').find('.focus');
            var t = p.children('a').find('span');
            if(t.css('display') === 'none'){
              var input = p.children('a').find('div > input');
              input.focus();
              return;
            }
            t.css('display', 'none');

            var input_div = $('' + 
            '<div class="input-group tree-input-group">' +
              '<input type="text" class="form-control">' +
              '<span class="input-group-addon"><i class="fa fa-check"></i></span>' +
            '</div>');

            var input = input_div.find('input');
            var done = input_div.find('span');
            input.val($.trim(t.html()));
            p.children('a').append(input_div);
            input.focus();

            input.click(function(e){
              e.preventDefault();
              e.stopPropagation();
            })

            input.blur(function(e){
              editTermClassName();
            })

            done.click(function(e){
              e.preventDefault();
              e.stopPropagation();
            })

            function editTermClassName(){
              var change = $.trim(input.val());
              var a = input.parent().parent();
              var t = a.children('span');
              
              // 终端组分类名称为空时恢复原名称
              if(change === ''){
                alert('终端分类名称不能为空');
                t.css('display','inline-block');
                input.parent().remove();
              }

              // 终端组分类名称未改变时不提交修改
              if( change ===  $.trim(t.html()) ){
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