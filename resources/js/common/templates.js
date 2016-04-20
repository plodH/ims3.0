define(function(require, exports, module){exports['channel_table_row']=function(obj){
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
__p+='<div id="layout-editor-wrapper"> <div class="layout-editor-header"> <button type="button" class="header-button-left glyphicon glyphicon-chevron-left"></button> <h1 class="header-title">编辑模板</h1><!-- <button type="button" class="header-button-right glyphicon glyphicon-floppy-disk">保存</button> --> </div> <div class="layout-editor-body"> <div class="row" style="height: 100%"> <div class="col-md-12" style="height: 100%"> <div class="box" style="height: 100%"><!-- header --> <div class="box-header with-border"> <i class="glyphicon glyphicon-th-large"></i> <h3 class="box-title">模板</h3> <small class="tips">tips:点击左边的控件按钮按钮，然后再画布上拖拽画出需要的大小</small> </div><!--edit--> <ul class="layout-editor-properties"> </ul><!-- toolbar --> <div class="layout-editor-toolbar"> <div class="btn-group-vertical"> <button data-widget-id="video" class="btn btn-default"> <i class="glyphicon glyphicon glyphicon-film"></i>&nbsp&nbsp视频 </button> <button data-widget-id="image" class="btn btn-default"> <i class="glyphicon glyphicon-picture"></i>&nbsp&nbsp图片 </button> <button data-widget-id="html" class="btn btn-default"> <i class="glyphicon glyphicon-font"></i>&nbsp&nbsp文本 </button> <button data-widget-id="clock" class="btn btn-default"> <i class="glyphicon glyphicon-time"></i>&nbsp&nbsp时钟 </button> <button data-widget-id="clock" class="btn btn-default"> <i class="glyphicon glyphicon-music"></i>&nbsp&nbsp音乐 </button> </div> <div class="btn-group-vertical" style="margin-top: 15px"> <button data-widget-id="clock" class="btn btn-default"> <i class="glyphicon glyphicon-trash"></i>&nbsp&nbsp删除 </button> </div> </div><!-- canvas --> <div class="layout-editor-canvas col-md-8"></div><!-- widget --> <div class="layout-editor-widget"> <ul class="layout-editor-widget-properties"> </ul> <div class="layout-editor-widgets"></div> </div> </div> </div> </div> </div> <div class="layout-editor-footer row"></div> </div>';
}
return __p;
};
exports['layout_edit_property']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li> <label>名称:</label> <input type="text" value="'+
((__t=(name))==null?'':__t)+
'"> </li> <li> <label>宽:</label> <input type="number" value="'+
((__t=(width))==null?'':__t)+
'"> </li> <li> <label>高:</label> <input type="number" value="'+
((__t=(height))==null?'':__t)+
'"> </li> <li> <label>背景颜色:</label> <input type="text" value="'+
((__t=(background_color))==null?'':__t)+
'"> </li> <li> <label>背景图片:</label> <input type="text" value="'+
((__t=(background_image))==null?'':__t)+
'"> </li>';
}
return __p;
};
exports['layout_edit_widgets']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul> ';
 widgets.forEach(function(el, idx, arr) { 
__p+=' <li> <div>'+
((__t=(el.name))==null?'':__t)+
'</div> </li> ';
 }); 
__p+=' </ul>';
}
return __p;
};
exports['layout_edit_widget_property']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<!-- <li>\r\n    <label>控件类型:</label>\r\n    <select> ';
 if (type !== 'image') { 
__p+=' <option value="image">图片控件</option> ';
 } else { 
__p+=' <option value="image" selected="selected">图片控件</option> ';
 } 
__p+=' ';
 if (type !== 'video') { 
__p+=' <option value="video">视频控件</option> ';
 } else { 
__p+=' <option value="video" selected="selected">视频控件</option> ';
 } 
__p+=' ';
 if (type !== 'html') { 
__p+=' <option value="html">Web文本控件</option> ';
 } else { 
__p+=' <option value="html" selected="selected">Web文本控件</option> ';
 } 
__p+=' ';
 if (type !== 'clock') { 
__p+=' <option value="clock">时钟控件</option> ';
 } else { 
__p+=' <option value="clock" selected="selected">时钟控件</option> ';
 } 
__p+=' </select>\r\n</li> --><!-- <label>\r\n        <i class="glyphicon glyphicon glyphicon-film"></i>&nbsp视频控件\r\n    </label>\r\n  --> <div class="input-group"> <span class="input-group-addon">上边距</span> <input type="number" value="'+
((__t=(top))==null?'':__t)+
'" class="form-control"> <span class="input-group-addon">像素</span> </div> <br> <div class="input-group"> <span class="input-group-addon">左边距</span> <input type="number" value="'+
((__t=(left))==null?'':__t)+
'" class="form-control"> <span class="input-group-addon">像素</span> </div> <br> <div class="input-group"> <span class="input-group-addon" style="letter-spacing: 7px">宽度</span> <input type="number" value="'+
((__t=(width))==null?'':__t)+
'" class="form-control"> <span class="input-group-addon">像素</span> </div> <br> <div class="input-group"> <span class="input-group-addon" style="letter-spacing: 7px">高度</span> <input type="number" value="'+
((__t=(height))==null?'':__t)+
'" class="form-control"> <span class="input-group-addon">像素</span> </div> <br> <div class="input-group"> <span class="input-group-addon" style="letter-spacing: 7px">顺序</span> <input type="number" value="'+
((__t=(zIndex))==null?'':__t)+
'" class="form-control"> <span class="input-group-addon">层</span> </div>';
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