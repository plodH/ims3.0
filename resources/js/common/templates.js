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
__p+='<div id="layout-editor-wrapper" class="container"> <div class="layout-editor-header row"> <button type="button" class="btn btn-flat btn-complete-layout">返回</button> <div class="button-group pull-right"> <button type="button" class="btn btn-flat btn-save-layout">保存</button> </div> </div> <div class="layout-editor-body row"> <div class="layout-editor-toolbar"> <ul> <li><button data-widget-id="image">图片控件</button></li> <li><button data-widget-id="video">视频控件</button></li> <li><button data-widget-id="html">Web文本控件</button></li> <li><button data-widget-id="clock">时钟控件</button></li> </ul> <ul> <li> <label>布局名称:</label> <input type="text" value="'+
((__t=(name))==null?'':__t)+
'"> </li> <li> <label>宽:</label> <input type="number" value="'+
((__t=(width))==null?'':__t)+
'"> </li> <li> <label>高:</label> <input type="number" value="'+
((__t=(height))==null?'':__t)+
'"> </li> <li> <label>背景颜色:</label> <input type="text" value="'+
((__t=(background_color))==null?'':__t)+
'"> </li> <li> <label>背景图片:</label> <input type="text" value="'+
((__t=(background_image))==null?'':__t)+
'"> </li> </ul> </div> <div class="layout-editor-canvas"> </div> <div class="layout-editor-widget"> </div> </div> <div class="layout-editor-footer row"></div> </div>';
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