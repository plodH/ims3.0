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
							tree.closeNode(li);
						}else{
							tree.openNode(li);
						}
	        })
	      })
	    }

	    tree.showEditInput = function(dom,fn){
	    	var t = dom.children('a').find('span');
        if(t.css('display') === 'none'){
          var input = dom.children('a').find('div > input');
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
        dom.children('a').append(input_div);
        input.focus();

	    	// 判断fn是否传入再处理
	    }

	    tree.openNode = function(dom){
	    	dom.addClass('open');
	    	dom.children('a').find('.fa-folder-o').removeClass('fa-folder-o').addClass('fa-folder-open-o');
	    }

	    tree.closeNode = function(dom){
	    	dom.removeClass('open');
	    	dom.children('a').find('.fa-folder-open-o').removeClass('fa-folder-open-o').addClass('fa-folder-o');
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