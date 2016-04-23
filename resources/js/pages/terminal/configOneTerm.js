define(function(require, exports, module) {
	
	var CONFIG = require('common/config'),
      UTIL = require("common/util.js");

  exports.termID;

  exports.init = function() {

    inputInit();
    loadInfo();

    // 关闭
    $('#single-term-class-close').click(function(){
      UTIL.cover.close();
    })

    // 保存
    $('#single-term-class-save').click(function(){
      var data = _tree.getSelectedNodeID();
      if(data.length === 0){
        alert('请选择分类');
      }else{
        exports.save(data[0].nodeId);
      }
    })
  }

  function inputInit(){
    $( "#CO-vol-slider" ).slider({
      max: 100,
      value: 60
    });
    // console.log( $( "#CO-vol-slider" ).val() );

    $('#CO-workWeekRepeat input[type="checkbox"]').iCheck({
          checkboxClass: 'icheckbox_minimal-blue'
        })
    $('#CO-workStart').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
    $('#CO-workEnd').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
    $('#CO-downloadStart').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
    $('#CO-downloadEnd').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
    $('#CO-restartTime').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
  }

  function loadInfo(){

  }

	
});
