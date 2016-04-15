define(function(require, exports, module) {

  var TREE = require("common/treetree.js");
  var UTIL = require("common/util.js");
  var CONFIG = require("common/config.js");

	exports.init = function(){
		
    UTIL.ajax(
      'POST', 
      CONFIG.serverRoot+'/backend_mgt/v2/termcategory', 
      {
        "project_name": UTIL.getCookie('project_name'),
        "action": "getTree"
      },
      function(data){
        if(data.rescode === '200'){
          data = data.TermTree.children;
          var tree = {domId: 'termclass-tree', canCheck: false};
          tree = TREE.new(tree);
          tree.createTree($('#'+tree.domId), data);
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


	}

  // $('#test').click(function(e){
  //   e.preventDefault();
  //   e.stopPropagation();
  // })

  // function initTreetree(){
  //   $('.treetree li .fa-angle-left').each(function(i, e){
  //     $(this).click(function(e){
  //       alert(1)
  //     })
  //   })

  //   $('.treetree li').each(function(i, e){
  //     $(this).click(function(e){
  //       e.preventDefault();
  //       e.stopPropagation();
  //     })
  //   })
  // }

});