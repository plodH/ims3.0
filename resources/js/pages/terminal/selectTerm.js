define(function(require, exports, module) {
	
	var CONFIG = require('common/config'),
      UTIL = require("common/util.js"),
      TREE = require("common/treetree.js"),
      _tree;

  exports.getSelectedTerm;

  exports.init = function() {
    initTree();

    // 关闭
    $('#term_sel_cancel').click(function(){
      UTIL.cover.close();
    })

    // 保存
    $('#move-term-class-move').click(function(){
      var categoryList = _tree.getSelectedNodeID();
      // alert('请选择终端分类或终端');
      // exports.getSelectedTerm(data);
    })
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
          _tree = {domId: 'select-termclass-tree', check: 'multiple'};
          _tree = TREE.new(_tree);
          _tree.createTree($('#'+_tree.domId), data);
          // 选中、打开第一个结点
          var li = $('#'+_tree.domId).find('li:nth(0)');
          _tree.openNode(li);
        }else{
          alert('获取终端分类失败');
        }
      }
    );
  }
	
});
