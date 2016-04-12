<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>  
<head>  
 <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <title>CLEAR IMS 3.0</title>  
   <script type='text/javascript' src="resources/plugins/jQuery/jQuery-2.2.0.min.js"></script>
   <script type='text/javascript' src="resources/js/config.js"></script>
  <style>


</style>
</head>  
<body onselectstart="return false;" style="background:url(resources/css/img/BG_default1.png) no-repeat;overflow:hidden;">  

<h1 >CLEAR IMS 3.0</h1>
 <h2>项目：</h2>
 
 <form method='POST' action='<c:url value='/j_spring_security_check' />'>  
		 <select name="j_project_name" >
        </select>
         <div class="UIdeco"></div>
        <input name="j_username"  type="text" placeholder="请输入账号" />
		<input name="j_password"  type="password" placeholder="密码" />

		<input id="loginBtn" type='submit'  value='→' />  
  </form>  

<c:if test='${not empty param.error}'>  
  <font color='red'>  
              登陆错误. <br />  
             原因 : ${sessionScope['SPRING_SECURITY_LAST_EXCEPTION'].message}  
  </font>  
</c:if>  
  <script type='text/javascript'>
  
  $(document).ready(function() {
	  var json_data = {
		        "Project": "",
		        "Action" : "Get"
		    }
	  $.ajax({
	        url: CONFIG.requestURL + "/backend_mgt/v1/projects",
	        type: "POST",
	        data: JSON.stringify(json_data),
	        dataType: "json",
	        success:function (data, textStatus){
					var projects  = data.Projects;
					for(var i=0; i<projects.length; i++)
					{    
					     $("select[name='j_project_name']").append("<option value='"+projects[i].project_name+"'>"+projects[i].project_name+"</option>");
					} 
	        }
	    });
  });
  
  
  
  
  </script>
</body>  
</html>