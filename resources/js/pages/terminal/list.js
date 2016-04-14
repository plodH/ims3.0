define(function(require, exports, module) {

	exports.init = function(){
		
    initTreetree();

	}

  // $('#test').click(function(e){
  //   e.preventDefault();
  //   e.stopPropagation();
  // })

  function initTreetree(){
    $('.treetree li .fa-angle-left').each(function(i, e){
      $(this).click(function(e){
        alert(1)
      })
    })

    $('.treetree li').each(function(i, e){
      $(this).click(function(e){
        e.preventDefault();
        e.stopPropagation();
      })
    })
  }

});