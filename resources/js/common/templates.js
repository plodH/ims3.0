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
'</td> <td><button class="btn-channel-detail">编辑</button></td> </tr>';
}
return __p;
};});