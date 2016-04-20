'use strict';

define(function(require, exports, module) {
	
	var templates = require('common/templates'),
		config = require('common/config'),
		util = require('common/util');

	var projectName = config.projectName,
		requestUrl = config.serverRoot;
		
	exports.init = function() {
		var channelId = Number(util.getHashParameters().id);
		if (!isNaN(channelId)) {
			var data = JSON.stringify({
				Action: 'GetPrograms',
				Project: projectName,
				ChannelID: String(channelId)
			});
			util.ajax('post', requestUrl + '/backend_mgt/v1/channels', data, function (res) {
				var data = JSON.stringify({
					Action: 'Get',
					Project: projectName
				});
				util.ajax('post', requestUrl + '/backend_mgt/v1/channels/' + channelId, data, function (res2) {
					onChannelListReady(res2.Channel, res.Programs);
				});
			});
		} else {
			channelId = -1;
			var defaultChannelInfo = {
				ID: -1,
				Name: '未命名频道',
				Name_eng: 'unknown channel',
				Overall_Schedule_Paras: '{"Type":"Sequence"}',
				Overall_Schedule_Type: 'Regular',
				Version: 0
			};
			onChannelListReady(defaultChannelInfo, []);
		}
	};

	function onChannelListReady(channelInfo, programs) {
		var programsJSON = [];
		programs.forEach(function (el, idx, arr) {
			programsJSON.push({
				id: el.ID,
				isTimeSegmentLimit: el.Is_TimeSegment_Limit,
				layoutId: el.Layout_ID,
				lifeStartTime: el.LifeStartTime,
				lifeEndTime: el.LifeEndTime,
				name: el.Name,
				scheduleParams: el.Schedule_Paras,
				scheduleType: el.Schedule_Type,
				sequence: el.Sequence,
				timeSegmentDuration: el.TimeSegment_Duration,
				timeSegmentStart: el.TimeSegment_Start
			});
		});
		var json = {
			id: channelInfo.ID,
			name: channelInfo.Name,
			nameEng: channelInfo.Name_eng,
			scheduleParams: channelInfo.Overall_Schedule_Paras,
			scheduleType: channelInfo.Overall_Schedule_Type,
			programs: programsJSON
		};
		renderProgramList(json);
		registerEventListener();
	}
	
	function registerEventListener() {
		$('#channel-editor-wrapper .btn-channel-editor-close').click(onCloseEditor);
        $('#channel-editor-wrapper .btn-channel-editor-save').click(onSaveChannel);
        $('#channel-editor-wrapper .btn-channel-editor-publish').click(onPublishChannel);
        $('#channel-editor-wrapper .btn-program-new').click(function () {
            onNewProgram(this.getAttribute('data-program-type'));
        });
        $('#channel-editor-wrapper .btn-program-delete').click(function () {
            var deleteType = this.getAttribute('data-program-type'),
                selectedProgram = findProgramById(g_CurrentProgramId);
            if (!selectedProgram || selectedProgram.scheduleType !== deleteType) {
                alert('没有选中节目');
                return;
            }
            onDeleteProgram(g_CurrentProgramId);
        });
        $('#channel-editor-wrapper .channel-program-schedule-type').change(function () {
            onProgramOrderChanged(this.value);
        });
	}

    function onCloseEditor() {
        $('#edit-page-container').html('').addClass('none');
        location.hash = '#channel/list';
    }

    function onSaveChannel() {
        console.log('save');
    }

    function onPublishChannel() {
        console.log('save & publish');
    }

    function onNewProgram(type) {
        console.log(type);
    }

    function onProgramOrderChanged(value) {
        console.log(value);
    }

    function onDeleteProgram(programId) {
        console.log(programId);
    }

    function findProgramById(id) {
        for (var i = 0; i < g_ProgramList.length; i ++) {
            if (g_ProgramList[i].id === id) {
                return g_ProgramList[i];
            }
        }
        return null;
    }

    var createProgram = function () {
        var localId = 0;
        return function (layoutId) {
            localId--;
            return {
                id: localId,
                isTimeSegmentLimit: 0,
                layoutId: layoutId,
                lifeStartTime: 0,
                lifeEndTime: 0,
                name: 0,
                scheduleParams: 0,
                scheduleType: 0,
                sequence: 0,
                timeSegmentDuration: 0,
                timeSegmentStart: 0
            };
        };
    };

    var g_RegularProgramIdQueue,
        g_TimedProgramIdQueue,
        g_ProgramList,
        g_CurrentProgramId;
	function renderProgramList(json) {
        var data = {
            name: json.name
        };
		$('#edit-page-container')
			.html(templates.channel_edit_main(data))
			.removeClass('none');
		var regularPrograms = [],
			timedPrograms = [],
			selectedProgram = null;
        g_RegularProgramIdQueue = [];
        g_TimedProgramIdQueue = [];
        g_ProgramList = json.programs;
		json.programs.forEach(function (el, idx, arr) {
			if (el.scheduleType === 'Regular') {
				regularPrograms.push(el);
                g_RegularProgramIdQueue.push(el.id);
			} else {
				timedPrograms.push(el);
                g_TimedProgramIdQueue.push(el.id);
			}
		});
		if (regularPrograms.length > 0) {
			regularPrograms[0].selected = true;
			selectedProgram = regularPrograms[0];
		} else if (timedPrograms.length > 0) {
			timedPrograms[0].selected = true;
			selectedProgram = timedPrograms[0];
		}
        g_CurrentProgramId = selectedProgram.id;
		renderRegularProgramList(regularPrograms);
		renderTimedProgramList(timedPrograms);
		loadProgram(selectedProgram);
	}
	
	function renderRegularProgramList(programs) {
		var ul = $('#channel-editor-wrapper .channel-program-list-regular ul');
		ul.html('');
		programs.forEach(function (el, idx, arr) {
			var data = {
				id: el.id,
				name: el.name
			};
			ul.append(templates.channel_edit_program_list_item(data));
		});
        var sortable = Sortable.create(ul[0], {
            onEnd: function (ev) {
                g_RegularProgramIdQueue = sortable.toArray().map(parseInt);
            }
        });
	}
	
	function renderTimedProgramList(programs) {
		var ul = $('#channel-editor-wrapper .channel-program-list-timed ul');
		ul.html('');
		programs.forEach(function (el, idx, arr) {
			var data = {
				id: el.id,
				name: el.name
			};
			ul.append(templates.channel_edit_program_list_item(data));
		});
        var sortable = Sortable.create(ul[0], {
            onEnd: function (ev) {
                g_TimedProgramIdQueue = sortable.toArray().map(parseInt);
            }
        });
	}

	function loadProgram(program) {
		console.log(program);
	}

	function renderProgram(program) {

	}
	
});
