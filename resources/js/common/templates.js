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
__p+='<div id="layout-editor-wrapper"> <div class="layout-editor-header"> <button type="button" class="btn-layout-editor-back">返回</button><!--<button type="button" class="btn-bigger">放大</button>\r\n            <button type="button" class="btn-smaller">缩小</button>--> <button type="button" class="btn-layout-editor-save">保存</button> </div> <div class="layout-editor-body"> <div class="layout-editor-toolbar"> <ul> <li><button class="btn-add-widget" data-widget-id="image">图片控件</button></li> <li><button class="btn-add-widget" data-widget-id="video">视频控件</button></li> <li><button class="btn-add-widget" data-widget-id="audio">音频控件</button></li> <li><button class="btn-add-widget" data-widget-id="html">Web文本控件</button></li> <li><button class="btn-add-widget" data-widget-id="clock">时钟控件</button></li> </ul> <ul class="layout-editor-properties"> </ul> </div> <div class="layout-editor-canvas"></div> <div class="layout-editor-widget"> <ul class="layout-editor-widget-properties"> </ul> <div class="layout-editor-widgets"></div> </div> </div> <div class="layout-editor-footer"></div> </div>';
}
return __p;
};
exports['layout_edit_property']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li> <label>布局名称:</label> <input type="text" value="'+
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
__p+='';
 if (widgets.length == 0) 
__p+=' <ul class="no-widget"> 没有控件! ';
 else { 
__p+=' <ul></ul> ';
 } 
__p+=' ';
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
__p+='<li> <label>控件类型:</label> <input type="text" readonly="readonly" value="'+
((__t=(type))==null?'':__t)+
'"> </li> <li> <label>上边距:</label> <input type="number" value="'+
((__t=(top))==null?'':__t)+
'" data-property-id="widget-top"> </li> <li> <label>左边距:</label> <input type="text" value="'+
((__t=(left))==null?'':__t)+
'" data-property-id="widget-left"> </li> <li> <label>宽:</label> <input type="number" value="'+
((__t=(width))==null?'':__t)+
'" data-property-id="widget-width"> </li> <li> <label>高:</label> <input type="text" value="'+
((__t=(height))==null?'':__t)+
'" data-property-id="widget-height"> </li> <li> <button class="btn-layout-editor-zindex-increase">上移一层</button> <button class="btn-layout-editor-zindex-decrease">下移一层</button> </li> <li> <button class="btn-layout-editor-delete-widget">删除控件</button> </li>';
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