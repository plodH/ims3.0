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

	      // 创建树
	      tree.createNode(dom, data);

	      //focus第一个结点
	      var li = dom.find('li:nth(0)');
	      li.addClass('open');
	      li.addClass('focus');
	      li.children('a').find('i.fa-folder-o').removeClass('fa-folder-o').addClass('fa-folder-open-o');

	      // 树的展开收起
	      $('#'+ tree.domId +' li .fa-angle-right').each(function(i, e){
	        $(this).click(function(e){
	        	e.preventDefault();
  		      e.stopPropagation();
	        	var li = $(this).parent().parent();
						if (li.hasClass('open')) {
							li.removeClass('open');
						}else{
							li.addClass('open');
						}
	        })
	      })
	    }

	    tree.setFocus = function(dom){
	    	$('#'+tree.domId).find('.focus').removeClass('focus');
        dom.addClass('focus');
	    }

	    tree.createNode = function(dom, data){

        // 是否可选中
        var checkbox = '';
        if(tree.canCheck === true){
          checkbox = '<input type="checkbox">';
        }

        for(var i = 0; i < data.length; i++){
          var treeview = '';
          var angle = '';

          // 是否有子结点
          if(data[i].children.length > 0){
            treeview = 'treeview';
            angle = '<i class="fa fa-angle-right"></i>';
          }

          var li = $('' +
            '<li node-id="' + data[i].id + '" class="' + treeview + '">' +
              '<a>' + checkbox + angle +
              '<i class="fa fa-folder-o"></i><span> ' + data[i].name + '</span>' +
              '</a>' +
            '</li>');

          dom.append(li);

          if(treeview === 'treeview'){
            var ul = $('<ul class="tree-menu-2"></ul>');
            li.append(ul);
            tree.createNode(ul, data[i].children);
          }
        }

      }

	    return tree;
	  }
	}

});