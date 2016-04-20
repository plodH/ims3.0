define(function(require, exports, module){exports['channel_edit_main']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div id="channel-editor-wrapper"> <div class="channel-editor-header"> <button class="btn-channel-editor-close">返回</button> <span>'+
((__t=(name))==null?'':__t)+
'</span> <button class="btn-channel-editor-save">保存</button> <button class="btn-channel-editor-publish">保存并发布</button> </div> <div class="channel-editor-body"> <div class="channel-program-list"> <div class="channel-program-list-timed"> <div> <h3>定时节目</h3> <button class="btn-program-delete" data-program-type="Timed">删除</button> <button class="btn-program-new" data-program-type="Timed">新建</button> </div> <ul></ul> </div> <div class="channel-program-list-regular"> <div> <h3>常规节目</h3> <select class="channel-program-schedule-type"> <option value="1">顺序</option> <option value="2">随机</option> <option value="3">比例</option> </select> <button class="btn-program-delete" data-program-type="Regular">删除</button> <button class="btn-program-new" data-program-type="Regular">新建</button> </div> <ul></ul> </div> </div> <div class="channel-program-editor"> </div> </div> <div class="channel-editor-footer"> </div> </div>';
}
return __p;
};
exports['channel_edit_program']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="channel-program-header"> </div>';
}
return __p;
};
exports['channel_edit_program_list_item']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li data-id="'+
((__t=(id))==null?'':__t)+
'"> <div>'+
((__t=(name))==null?'':__t)+
'</div> </li>';
}
return __p;
};
exports['channel_table_row']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<tr data-channel-id="'+
((__t=(id))==null?'':__t)+
'"> <td><input type="checkbox"></td> <td>频道名称:'+
((__t=(name))==null?'':__t)+
'</td> <td>调度类型:'+
((__t=(schedule_type))==null?'':__t)+
'</td> <td>调度参数:'+
((__t=(schedule_params))==null?'':__t)+
'</td> <td>版本:'+
((__t=(version))==null?'':__t)+
'</td> <td><a href="#channel/edit?id='+
((__t=(id))==null?'':__t)+
'" class="btn-channel-detail">编辑</a></td> </tr>';
}
return __p;
};
exports['layout_edit_main']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div id="layout-editor-wrapper"> <div class="layout-editor-header"> <button type="button" class="header-button-left glyphicon glyphicon-chevron-left btn-layout-editor-back"></button> <button type="button" class="btn-layout-editor-save">保存</button> <h1 class="header-title">编辑模板</h1><!-- <button type="button" class="header-button-right glyphicon glyphicon-floppy-disk">保存</button> --> </div> <div class="layout-editor-body"> <div class="row" style="height: 100%"> <div class="col-md-12" style="height: 100%"> <div class="box" style="height: 100%"><!-- header --> <div class="box-header with-border"> <i class="glyphicon glyphicon-th-large"></i> <h3 class="box-title">模板</h3> <small class="tips">tips:点击左边的控件按钮按钮，然后再画布上拖拽画出需要的大小</small> </div><!--edit--> <ul class="layout-editor-properties"> </ul><!-- toolbar --> <div class="layout-editor-toolbar"> <div class="btn-group-vertical"> <button data-widget-id="video" class="btn btn-default"> <i class="glyphicon glyphicon glyphicon-film"></i>&nbsp&nbsp视频 </button> <button data-widget-id="image" class="btn btn-default"> <i class="glyphicon glyphicon-picture"></i>&nbsp&nbsp图片 </button> <button data-widget-id="html" class="btn btn-default"> <i class="glyphicon glyphicon-font"></i>&nbsp&nbsp文本 </button> <button data-widget-id="clock" class="btn btn-default"> <i class="glyphicon glyphicon-time"></i>&nbsp&nbsp时钟 </button> <button data-widget-id="clock" class="btn btn-default"> <i class="glyphicon glyphicon-music"></i>&nbsp&nbsp音乐 </button> </div> <div class="btn-group-vertical" style="margin-top: 15px"> <button data-widget-id="clock" class="btn btn-default"> <i class="glyphicon glyphicon-trash"></i>&nbsp&nbsp删除 </button> </div> </div><!-- canvas --> <div class="layout-editor-canvas col-md-8"></div><!-- widget --> <div class="layout-editor-widget"> <ul class="layout-editor-widget-properties"> </ul> <div class="layout-editor-widgets"></div> </div> </div> </div> </div> </div> <div class="layout-editor-footer"></div> </div>';
}
return __p;
};
exports['layout_edit_property']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li> <label>名称:</label> <input type="text" value="'+
((__t=(name))==null?'':__t)+
'" data-property-id="layout-name"> </li> <li> <label>宽:</label> <input type="number" value="'+
((__t=(width))==null?'':__t)+
'" data-property-id="layout-width"> </li> <li> <label>高:</label> <input type="number" value="'+
((__t=(height))==null?'':__t)+
'" data-property-id="layout-height"> </li> <li> <label>背景颜色:</label> <input type="color" value="'+
((__t=(background_color))==null?'':__t)+
'" data-property-id="layout-bg-color"> </li> <li> <button class="btn-layout-editor-background">背景图片</button> </li>';
}
return __p;
};
exports['layout_edit_widgets']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul> ';
 for (var i = widgets.length - 1; i >= 0; i--) { var el = widgets[i]; 
__p+=' ';
 if (el.focused) { 
__p+=' <li style="background-color: '+
((__t=(el.background_color))==null?'':__t)+
'" data-widget-index="'+
((__t=(i))==null?'':__t)+
'" class="focused"> ';
 } else { 
__p+=' </li><li style="background-color: '+
((__t=(el.background_color))==null?'':__t)+
'" data-widget-index="'+
((__t=(i))==null?'':__t)+
'"> ';
 } 
__p+=' <div>'+
((__t=(el.name))==null?'':__t)+
'</div> </li> ';
 }  
__p+=' </ul>';
}
return __p;
};
exports['layout_edit_widget_property']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<!-- <label>\r\n        <i class="glyphicon glyphicon glyphicon-film"></i>&nbsp视频控件\r\n    </label>\r\n--> <li> <label>控件类型:</label> <input type="text" readonly="readonly" value="'+
((__t=(type))==null?'':__t)+
'"> </li> <div class="input-group"> <span class="input-group-addon">上边距</span> <input type="number" value="'+
((__t=(top))==null?'':__t)+
'" class="form-control" data-property-id="widget-top"> <span class="input-group-addon">像素</span> </div> <br> <div class="input-group"> <span class="input-group-addon">左边距</span> <input type="number" value="'+
((__t=(left))==null?'':__t)+
'" class="form-control" data-property-id="widget-top"> <span class="input-group-addon">像素</span> </div> <br> <div class="input-group"> <span class="input-group-addon" style="letter-spacing: 7px">宽度</span> <input type="number" value="'+
((__t=(width))==null?'':__t)+
'" class="form-control" data-property-id="widget-left"> <span class="input-group-addon">像素</span> </div> <br> <div class="input-group"> <span class="input-group-addon" style="letter-spacing: 7px">高度</span> <input type="number" value="'+
((__t=(height))==null?'':__t)+
'" class="form-control" data-property-id="widget-width"> <span class="input-group-addon">像素</span> </div> <br> <li> <button class="btn-layout-editor-zindex-increase">上移一层</button> <button class="btn-layout-editor-zindex-decrease">下移一层</button> </li> <li> <button class="btn-layout-editor-delete-widget">删除控件</button> </li>';
}
return __p;
};
exports['layout_table_row']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<tr data-layout-id="'+
((__t=(id))==null?'':__t)+
'"> <td><input type="checkbox"></td> <td>布局名称:'+
((__t=(name))==null?'':__t)+
'</td> <td>布局宽:'+
((__t=(width))==null?'':__t)+
'</td> <td>布局高:'+
((__t=(height))==null?'':__t)+
'</td> <td>背景色:'+
((__t=(background_color))==null?'':__t)+
'</td> <td>上传时间:'+
((__t=(create_time))==null?'':__t)+
'</td> <td><a href="#layout/edit?id='+
((__t=(id))==null?'':__t)+
'" class="btn-table-detail">编辑</a></td> </tr>';
}
return __p;
};});