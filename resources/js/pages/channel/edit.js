'use strict';

define(function(require, exports, module) {

	/**
	 * 声明依赖的所有模块
	 */
	var templates = require('common/templates'),
		config = require('common/config'),
		util = require('common/util'),
		layoutDialog = require('pages/layout/list_dialog');

	/**
	 * 全局配置
	 */
	var projectName = config.projectName,
		requestUrl = config.serverRoot;

	/**
	 * 页面入口
	 */
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
					onChannelListReady(res2.Channel[0], res.Programs);
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

	/**
	 * 请求频道数据成功的回调函数
	 * @param channelInfo
	 * @param programs
     */
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
		registerEventListeners();
	}

	/**
	 * 注册事件监听
	 */
	function registerEventListeners() {
		$('#channel-editor-wrapper .btn-channel-editor-close').click(onCloseEditor);
        $('#channel-editor-wrapper .btn-channel-editor-save').click(onSaveChannel);
        $('#channel-editor-wrapper .btn-channel-editor-publish').click(onPublishChannel);
        $('#channel-editor-wrapper .btn-program-new').click(function () {
            var type = this.getAttribute('data-program-type');
			layoutDialog.open();
			layoutDialog.onSelect(function (layoutId) {
				layoutDialog.close();
				onNewProgram(type, layoutId);
			});
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
		$('#channel-editor-wrapper ul').delegate('li', 'click', function () {
			var programId = Number(this.getAttribute('data-id'));
			loadProgram(programId);
		});
		$('#channel-editor-wrapper .editable-span').click(function () {
			var $this = $(this),
				value = $this.text();
			if ($this.hasClass('editing')) {
				return;
			}
			$this
				.addClass('editing')
				.html('');
			$('<input>')
				.attr({
					type: 'text',
					value: value
				}).appendTo($this).focus();
		});
		$('#channel-editor-wrapper .editable-span').delegate('input', 'focusout', function () {
			var $this = $(this),
				$parent = $this.parent(),
				value = $this.val();
			$parent.text(value).removeClass('editing');
			$this.remove();
		});
	}

	/**
	 * 关闭页面的回调函数
	 */
    function onCloseEditor() {
        $('#edit-page-container')
			.html('')
			.addClass('none');
        location.hash = '#channel/list';
    }

	/**
	 * 保存频道的回调函数
	 */
    function onSaveChannel() {
        console.log('save');
    }

	/**
	 * 保存并发布的回调函数
	 */
    function onPublishChannel() {
        console.log('save & publish');
    }

	/**
	 * 创建新节目
	 * @param type
	 * @param layoutId
     */
    function onNewProgram(type, layoutId) {
		var program = createProgram(type, layoutId),
			ul = $(type === 'Regular' ?
				'#channel-editor-wrapper .channel-program-list-regular ul' :
				'#channel-editor-wrapper .channel-program-list-timed ul'
			),
			data = {
				id: program.id,
				name: program.name
			};
		g_ProgramList.push(program);
		ul.append(templates.channel_edit_program_list_item(data));
		loadProgram(program.id);
    }

	/**
	 * 删除节目
	 * @param programId
     */
    function onDeleteProgram(programId) {
		$('#channel-editor-wrapper ul>li[data-id='+ programId +']').remove();
		removeProgramById(programId);
    }

	/**
	 * 获取节目
	 * @param id
	 * @returns {*}
     */
    function findProgramById(id) {
        for (var i = 0; i < g_ProgramList.length; i++) {
            if (g_ProgramList[i].id === id) {
                return g_ProgramList[i];
            }
        }
        return null;
    }

	/**
	 * 移除节目
	 * @param id
     */
	function removeProgramById(id) {
		var index = -1;
		for (var i = 0; i < g_ProgramList.length; i++) {
			if (g_ProgramList[i].id === id) {
				index = i;
				break;
			}
		}
		g_ProgramList.splice(index, 1);
		if (g_CurrentProgramId === id) {
			g_CurrentProgramId = g_ProgramList.length > 0 ? g_ProgramList[0].id : 0;
		}
		loadProgram(g_CurrentProgramId);
	}

	/**
	 * 创建新节目，新节目的id<0且都不相同
	 */
    var createProgram = (function () {
        var localId = 0;
        return function (type, layoutId) {
            localId--;
            return {
                id: localId,
                isTimeSegmentLimit: 0,
                layoutId: layoutId,
                lifeStartTime: 0,
                lifeEndTime: 0,
                name: '新建节目',
                scheduleParams: 0,
                scheduleType: type,
                sequence: 0,
                timeSegmentDuration: 0,
                timeSegmentStart: 0
            };
        };
    }());

	/**
	 * 保存常规节目的序列
	 */
    var g_RegularSortable,
		/**
		 * 定时节目的序列
		 */
        g_TimedSortable,
		/**
		 * 所有节目的列表
		 */
        g_ProgramList,
		/**
		 * 当前节目的id
		 */
        g_CurrentProgramId;

	/**
	 * 初始化节目列表
	 * @param json
     */
	function renderProgramList(json) {
        var data = {
            name: json.name,
			overall_schedule_params: json.scheduleParams,
			overall_schedule_type: json.scheduleType
        };
		$('#edit-page-container')
			.html(templates.channel_edit_main(data))
			.removeClass('none');
		var regularPrograms = [],
			timedPrograms = [],
			selectedProgram = null;
        g_ProgramList = json.programs;
		json.programs.forEach(function (el, idx, arr) {
			if (el.scheduleType === 'Regular') {
				regularPrograms.push(el);
			} else {
				timedPrograms.push(el);
			}
		});
		if (regularPrograms.length > 0) {
			regularPrograms[0].selected = true;
			selectedProgram = regularPrograms[0];
		} else if (timedPrograms.length > 0) {
			timedPrograms[0].selected = true;
			selectedProgram = timedPrograms[0];
		}
		renderRegularProgramList(regularPrograms);
		renderTimedProgramList(timedPrograms);
		loadProgram(selectedProgram ? selectedProgram.id : 0);
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
        g_RegularSortable = Sortable.create(ul[0], {});
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
		g_TimedSortable = Sortable.create(ul[0], {});
	}

	function loadProgram(programId) {
		g_CurrentProgramId = programId;
		$('#channel-editor-wrapper ul>li').removeClass('selected');
		$('#channel-editor-wrapper ul>li[data-id=' + g_CurrentProgramId + ']').addClass('selected');
	}
	
});
