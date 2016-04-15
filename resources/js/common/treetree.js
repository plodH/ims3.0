define(function(require, exports, module) {

	exports.new = function(tree){
		return Tree.new(tree);
	}

	var Tree = {
	  new: function(t){

	    var tree = {};
	    tree.domId = t.domId;
	    tree.canCheck = t.canCheck;

	    tree.createTree = function(dom, data){

	      if(data.length === 0) {
	        return;
	      }

	      createLeaf(dom, data);
	      var li = dom.find('li:nth(0)');
	      li.addClass('open');
	      li.addClass('focus');
	      li.children('a').find('i.fa-folder-o').removeClass('fa-folder-o').addClass('fa-folder-open-o');

	      function createLeaf(dom, data){

	        // 是否可选中
	        var checkbox = '';
	        if(tree.canCheck === true){
	          checkbox = '<input type="checkbox">';
	        }

	        for(var i = 0; i < data.length; i++){
	          var treeview = '';
	          var angle = '';

	          // 是否有孩子
	          if(data[i].children.length > 0){
	            treeview = 'treeview';
	            angle = '<i class="fa fa-angle-right"></i>';
	          }

	          var li = $('' +
	            '<li id="' + data[i].id + '" class="' + treeview + '">' +
	              '<a>' + checkbox + angle +
	                '<i class="fa fa-folder-o"></i> ' + data[i].name +
	              '</a>' +
	            '</li>');

	          dom.append(li);

	          if(treeview === 'treeview'){
	            var ul = $('<ul class="tree-menu-2"></ul>');
	            li.append(ul);
	            createLeaf(ul, data[i].children);
	          }
	        }

	      }

	    };

	    return tree;
	  }
	}

});