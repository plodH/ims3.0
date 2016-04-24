define(function(require, exports, module) {
	
	var CONFIG = require('common/config'),
      UTIL = require("common/util.js");

  exports.termID;
  exports.termName;
  exports.IP;
  exports.MAC;

  exports.init = function() {

    inputInit();
    loadInfo();

    // 关闭
    $('#CO-close').click(function(){
      UTIL.cover.close();
    })

    // 保存
    $('#CO-save').click(function(){
    
    })  
  }

  function inputInit(){
    $( "#CO-vol-slider" ).slider({
      max: 100,
      value: 60
    });

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

    $('#CO-title').html(exports.termName);
    $('#CO-term-name').val(exports.termName);
    $('#CO-IP').html(exports.IP);
    $('#CO-MAC').html(exports.MAC);

      var data = {
        "project_name": "newui_dev",
        "action": "getConfig",
        "ID": exports.termID
      }

    UTIL.ajax(
      'POST', 
      CONFIG.serverRoot + '/backend_mgt/v2/term',
      JSON.stringify(data),
      function(data){
        if(data.rescode !== '200'){
          alert('获取终端配置信息失败');
        }else{
          $('#CO-upgradeURL').val(data.config.UpgradeURL);
          $('#CO-logURL').val(data.config.LogURL);
          $("#CO-vol-slider").val(data.config.Volume);

          var config = data.config;
          config = {
            "DownloadSeqments":"{\"on\": 1, \"duration\": 999999, \"trigger\": \"1 2 3 * * * *\"}",
            "WorkSeqments":"{\"on\": 1, \"duration\": 1, \"trigger\": \"13 * 5 * * * 1,2,7\"}",
            "UpgradeURL":"117","Volume":60,"Channel_ID":117,"PreDownload_Channel_ID":117,
            "HeartBeat_Period":3,"CityIDs":"","MainServer":null,
            "RestartTimer":"{\"on\": 1, \"trigger\": \"2 3 * * * * *\"}",
            "ProgramSync":"{\"on\": 0, \"SyncSetID\": \"1-1\", \"SyncMulticastIP\": \"225.2.3.4\", \"SyncMulticastPort\": 9000, \"SyncSwitchTimeout\": 300}",
            "LogURL":null
          }

          //工作区间
          var workSeqments = JSON.parse(config.WorkSeqments);
          if(workSeqments.on === 1){
            var trigger = workSeqments.trigger.split(" ");

            //week
            var week = trigger[6];
            if(week !== '*'){
              week = week.split(',');
              for(var i=0; i< week.length; i++){
                $('#CO-workWeekRepeat input[type$=checkbox]:nth('+(Number(week[i])-1)+')').iCheck('check');
              }
            }

            //starttime
            var hour = trigger[0];
            var minute = trigger[1];
            var second = trigger[2];
            if(hour !== '*' || minute !== '*' || second !== '*'){
              hour = (hour === '*')?'00':((hour<10)?'0'+hour:hour);
              minute = (minute === '*')?'00':((minute<10)?'0'+minute:minute);
              second = (second === '*')?'00':((second<10)?'0'+second:second);
            }
            $('#CO-workStart').val(hour+':'+minute+':'+second);

            //endtime
            var duration = workSeqments.duration;
            var start = new Date('2016-04-24 '+hour+':'+minute+':'+second);
            var end = new Date();
            end.setTime(start.getTime()+duration*1000);
            var end_hour = end.getHours();
            var end_minute = end.getMinutes();
            var end_second = end.getSeconds();
            end_hour = (end_hour === '*')?'00':((end_hour<10)?'0'+end_hour:end_hour);
            end_minute = (end_minute === '*')?'00':((end_minute<10)?'0'+end_minute:end_minute);
            end_second = (end_second === '*')?'00':((end_second<10)?'0'+end_second:end_second);
            $('#CO-workEnd').val(end_hour+':'+end_minute+':'+end_second);
          }

          // 下载区间
          var DownloadSeqments = JSON.parse(config.DownloadSeqments);
          if(DownloadSeqments.on === 1){
            var trigger = DownloadSeqments.trigger.split(" ");

            //starttime
            var hour = trigger[0];
            var minute = trigger[1];
            var second = trigger[2];
            if(hour !== '*' || minute !== '*' || second !== '*'){
              hour = (hour === '*')?'00':((hour<10)?'0'+hour:hour);
              minute = (minute === '*')?'00':((minute<10)?'0'+minute:minute);
              second = (second === '*')?'00':((second<10)?'0'+second:second);
            }
            $('#CO-downloadStart').val(hour+':'+minute+':'+second);

            //endtime
            var duration = DownloadSeqments.duration;
            var start = new Date('2016-04-24 '+hour+':'+minute+':'+second);
            var end = new Date();
            end.setTime(start.getTime()+duration*1000);
            var end_hour = end.getHours();
            var end_minute = end.getMinutes();
            var end_second = end.getSeconds();
            end_hour = (end_hour === '*')?'00':((end_hour<10)?'0'+end_hour:end_hour);
            end_minute = (end_minute === '*')?'00':((end_minute<10)?'0'+end_minute:end_minute);
            end_second = (end_second === '*')?'00':((end_second<10)?'0'+end_second:end_second);
            $('#CO-downloadEnd').val(end_hour+':'+end_minute+':'+end_second);
          }

          // 定时重启
          var RestartTimer = JSON.parse(config.RestartTimer);
          if(RestartTimer.on === 1){
            var trigger = RestartTimer.trigger.split(" ");

            //starttime
            var hour = trigger[0];
            var minute = trigger[1];
            var second = trigger[2];
            if(hour !== '*' || minute !== '*' || second !== '*'){
              hour = (hour === '*')?'00':((hour<10)?'0'+hour:hour);
              minute = (minute === '*')?'00':((minute<10)?'0'+minute:minute);
              second = (second === '*')?'00':((second<10)?'0'+second:second);
            }
            $('#CO-restartTime').val(hour+':'+minute+':'+second);
          }

        }
      }
    );
  }

	
});
