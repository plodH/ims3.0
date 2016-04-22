
define(function (require, exports, module) {
    'use strict';

    var templates = require('common/templates'),
        config = require('common/config'),
        util = require('common/util'),
        layoutEditor = require('common/layout_editor');

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
        this.renderEditor();
        this.registerEventListeners();
        this.loadWidget(this.layout.widgets[0]);
    };

    ProgramView.prototype.renderEditor = function () {
        var widgets = [],
            data = {
                id: this.layout.id,
                name: this.layout.name,
                nameEng: this.layout.nameEng,
                width: this.layout.width,
                height: this.layout.height,
                topMargin: this.layout.topMargin,
                leftMargin: this.layout.leftMargin,
                rightMargin: this.layout.rightMargin,
                bottomMargin: this.layout.bottomMargin,
                backgroundColor: this.layout.backgroundColor,
                backgroundImage: this.layout.backgroundImage,
                widgets: widgets
            },
            canvas = $('#channel-editor-wrapper .channel-program-layout-body'),
            canvasHeight = canvas.height(),
            canvasWidth = canvas.width();
        this.layout.widgets.forEach(function (el, idx, arr) {
            widgets.push({
                top: el.top,
                left: el.left,
                width: el.width,
                height: el.height,
                id: el.id,
                type: el.type,
                typeName: el.typeName
            });
        });
        this.editor = new layoutEditor.LayoutEditor(data, canvasWidth, canvasHeight, false);
        this.editor.attachToDOM(canvas[0]);
        for (var i = this.editor.mLayout.mWidgets.length - 1; i >= 0; i--) {
            var widget = this.editor.mLayout.mWidgets[i],
                data = {
                    id: widget.mId,
                    name: widget.mTypeName,
                    background_color: widget.mBackgroundColor
                };
            $('#channel-editor-wrapper .channel-program-layout-footer>ul')
                .append(templates.channel_edit_widget_item(data));
        }
    };

    ProgramView.prototype.previewData = function () {
        var resources = {};
        this.layout.widgets.forEach(function (el, idx, arr) {
            var data = null;
            switch (el.type) {
                case 'WebBox':
                    data = {material: el.material, style: el.style === '' ? {} : JSON.parse(el.style)};
                    break;
                case 'ClockBox':
                    data = {};
                    break;
                case 'VideoBox':
                    data = {material: el.material};
                    break;
                case 'ImageBox':
                    data = {material: el.material};
                    break;
            }
            if (data) {
                resources[el.id] = data;
            }
        });
        return resources;
    };
    
    ProgramView.prototype.destroy = function () {
        
    };

    ProgramView.prototype.registerEventListeners = function () {
        var self = this;
        this.editor.onFocusChanged(function () {
            var focusedWidget = self.editor.getLayout().getFocusedWidget();
            var widgetId = focusedWidget.mId;
            self.onSelectWidget(self.findWidgetById(widgetId));
        });
        $('#channel-editor-wrapper .channel-program-layout-footer li').click(function () {
            var widgetId = Number(this.getAttribute('data-id')), widgets = self.editor.mLayout.mWidgets;
            for (var i = 0; i < widgets.length; i++) {
                if (widgets[i].mId === widgetId) {
                    widgets[i].requestFocus();
                }
            }
            //self.onSelectWidget(self.findWidgetById(widgetId));
        });
        $('#channel-editor-wrapper .btn-channel-preview').click(function () {
            if (!self.editMode) {
                self.editor.showPreview(self.previewData());
                self.editMode = true;
            } else {
                self.editor.hidePreview();
                self.editMode = false;
            }
        });
    };

    ProgramView.prototype.findWidgetById = function (id) {
        for (var i = 0; i < this.layout.widgets.length; i++) {
            if (this.layout.widgets[i].id === id) {
                return this.layout.widgets[i];
            }
        }
        return null;
    };

    ProgramView.prototype.onSelectWidget = function (widget) {
        this.loadWidget(widget);

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

    ProgramView.prototype.loadWidget = function (widget) {
        this.curentWidget = widget;
        localStorage.setItem('widget', JSON.stringify(widget));
        $('#channel-editor-wrapper .channel-program-widget').load('resources/pages/channel/edit_widget.html');
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
                    layout = {
                        name: res.Layout.Name,
                        nameEng: res.Layout.Name_eng,
                        width: res.Layout.Width,
                        height: res.Layout.Height,
                        topMargin: res.Layout.TopMargin,
                        leftMargin: res.Layout.LeftMargin,
                        rightMargin: res.Layout.RightMargin,
                        bottomMargin: res.Layout.BottomMargin,
                        backgroundColor: res.Layout.BackgroundColor,
                        backgroundImage: {
                           url: res.Layout.BackgroundPic_URL
                        }
                    };
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
