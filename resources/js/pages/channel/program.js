
define(function (require, exports, module) {
    'use strict';

    var templates = require('common/templates'),
        config = require('common/config'),
        util = require('common/util');

    var requestUrl = config.serverRoot,
        projectName = config.projectName;

    function ProgramView(program) {
        this.id = program.id;
        this.isTimeSegmentLimit = program.isTimeSegmentLimit;
        this.layoutId = program.layoutId;
        this.lifeStartTime = program.lifeStartTime;
        this.lifeEndTime = program.lifeEndTime;
        this.name = program.name;
        this.scheduleParams = program.scheduleParams;
        this.scheduleType = program.scheduleType;
        this.sequence = program.sequence;
        this.timeSegmentDuration = program.timeSegmentDuration;
        this.timeSegmentStart = program.timeSegmentStart;
        this.layout = null;
    }
    
    ProgramView.prototype.exportAsJSON = function () {
    };
    
    ProgramView.prototype.onEvent = function () {
        
    };
    
    ProgramView.prototype.render = function () {
        var data = {
            lifetime_start: this.lifeStartTime,
            lifetime_end: this.lifeEndTime,
            schedule_type: this.scheduleType,
            schedule_params: this.scheduleParams,
            layout: {
                name: this.layout.name,
                width: this.layout.width,
                height: this.layout.height
            }
        };
        $('#channel-editor-wrapper .channel-program-editor')
            .html(templates.channel_edit_program(data));
    };
    
    ProgramView.prototype.destroy = function () {
        
    };
    
    function createProgramView(program) {
        return new ProgramView(program);
    }

    function requestMaterials(widgetIds, cb) {
        if (widgetIds.length === 0) {
            cb({});
            return;
        }
        var successCount = 0, failed = false, responses = {};
        widgetIds.forEach(function (el, idx, arr) {
            var data = JSON.stringify({
                Action: 'GetMaterials',
                Project: projectName,
                ControlBoxID: String(el)
            });
            util.ajax('post', requestUrl + '/backend_mgt/v1/controlboxes', data, function (res) {
                if (!failed && Number(res.rescode) !== 200) {
                    failed = true;
                    cb({err: res});
                    return;
                }
                successCount++;
                responses[el] = res.Materials;
                if (successCount === widgetIds.length) {
                    cb(responses);
                }
            });
        });
    }
    
    function loadProgramView(view) {

        if (view.layout) {
            view.render();
        } else {
            var data = JSON.stringify({
                Action: 'GetControlBoxs',
                Project: projectName,
                ProgramID: view.id
            });
            util.ajax('post', requestUrl + '/backend_mgt/v1/programs', data, function (res) {
                var widgetIds = [],
                    widgets = [],
                    layout = {};
                res.ControlBoxs.forEach(function (el, idx, arr) {
                    widgetIds.push(el.ID);
                    widgets.push({
                        material: el.ControlBox_Material,
                        type: el.ControlBox_Type,
                        typeId: el.ControlBox_Type_ID,
                        typeName: el.ControlBox_Type_Name,
                        height: el.Height,
                        id: el.ID,
                        left: el.Left,
                        overallScheduleParams: el.Overall_Schedule_Paras,
                        overallScheduleType: el.Overall_Schedule_Type,
                        programId: el.Program_ID,
                        style: el.Style,
                        top: el.Top,
                        width: el.Width,
                        zIndex: el.Z
                    });
                });
                layout.widgets = widgets;

                requestMaterials(widgetIds, function (data) {
                    if (data.err) {
                        alert(data.err);
                        return;
                    }
                    widgets.forEach(function (el, idx, arr) {
                        el.resources = data[el.id].map(function (material) {
                            return {
                                id: material.ID,
                                widgetId: material.ControlBox_ID,
                                isTimeSegmentLimit: material.Is_TimeSegment_Limit,
                                lifeStartTime: material.LifeStartTime,
                                lifeEndTime: material.LifeEndTime,
                                name: material.Name,
                                nameEng: material.Name_eng,
                                scheduleParams: material.Schedule_Paras,
                                scheduleType: material.Schedule_Type,
                                sequence: material.Sequence,
                                timeSegmentDuration: material.TimeSegment_Duration,
                                timeSegmentStart: material.TimeSegment_Start,
                                typeId: el.Type_ID,
                                typeName: el.Type_Name,
                                url: el.URL
                            };
                        });
                    });
                    view.layout = layout;
                    view.render();
                });
            });
        }

    }
    
    exports.createProgramView = createProgramView;
    exports.loadProgramView = loadProgramView;

});