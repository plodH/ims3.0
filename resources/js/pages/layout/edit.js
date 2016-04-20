'use strict';

define(function(require, exports, module) {

    /**
     * 依赖的所有模块
     */
	var templates = require('common/templates'),
		config    = require('common/config'),
		util      = require('common/util'),
        layoutEditor    = require('common/layout_editor');

    /**
     * 模块全局变量
     * @type {*}
     */
    var requestUrl  = config.serverRoot,
        projectName = config.projectName,
        layoutId    = -1,
        editor      = null,
        oldWidgetIds = [];

    /**
     * 页面初始化
     */
	exports.init = function() {
		layoutId = Number(util.getHashParameters().id);
        if (!isNaN(layoutId)) {
            var data = JSON.stringify({
                project_name: projectName,
                action: 'getCBLList',
                data: {
                    layout_id: layoutId
                }
            });
            util.ajax('post', requestUrl + '/backend_mgt/v1/layout', data, onLayoutDataAvaiable);
        } else {
            var defaultLayout = {
                layout_id: -1,
                Name: '新建布局',
                Name_eng: 'new layout',
                Width: '1920',
                Height: '1080',
                BackgroundPic: '',
                BackgroundColor: '#000000',
                TopMargin: '0',
                RightMargin: '0',
                BottomMargin: '0',
                LeftMargin: '0',
                Layout_ControlBoxs: []
            };
            onLayoutDataAvaiable(defaultLayout);
        }
	};

    /**
     * 过滤网络数据
     */
    function onLayoutDataAvaiable(res) {
        var widgets = [];
        res.Layout_ControlBoxs.sort(function (a, b) {
            return a.Zorder - b.Zorder;
        });
        res.Layout_ControlBoxs.forEach(function (el, idx, arr) {
            widgets.push({
                top: el.Top,
                left: el.Left,
                width: el.Width,
                height: el.Height,
                id: el.ID,
                type: el.Type,
                typeName: el.Type_Name
            });
            if (el.ID !== -1) {
                oldWidgetIds.push(el.ID);
            }
        });
        var data = {
            id:             res.ID,
            name:           res.Name,
            nameEng:       res.Name_eng,
            width:          res.Width,
            height:         res.Height,
            topMargin:      res.TopMargin,
            leftMargin:     res.LeftMargin,
            rightMargin:    res.RightMargin,
            bottomMargin:   res.BottomMargin,
            backgroundColor:res.BackgroundColor,
            backgroundImage: {
                id: res.BackgroundPic.ID,
                url: res.BackgroundPic.URL,
                type: res.BackgroundPic.Type
            },
            widgets:        widgets
        };
        renderMain(data);
        registerEventListeners();
        onWidgetsListUpdate();
    }

    /**
     * 渲染主页面
     * @param data
     */
    function renderMain(data) {

        /************** main ****************/

        $('#edit-page-container')
            .html(templates.layout_edit_main({}))
            .removeClass('none');

        /************** layout properties **************/
        var properties = {
            name: data.name,
            width: data.width,
            height: data.height,
            background_color: data.backgroundColor
        };
        $('#layout-editor-wrapper .layout-editor-properties')
            .html(templates.layout_edit_property(properties));

        /*************** widget list *****************/
        var widgets = [];
        data.widgets.forEach(function (el) {
            widgets.push({
                name: el.name
            });
        });
        $('#layout-editor-wrapper .layout-editor-widgets')
            .html(templates.layout_edit_widgets({widgets: widgets}));

        /*************** editor *******************/
        var canvas = $('#layout-editor-wrapper .layout-editor-canvas'),
            canvasHeight = canvas.height(),
            canvasWidth = canvas.width();
        editor = new layoutEditor.LayoutEditor(data, canvasWidth, canvasHeight);
        editor.attachToDOM(canvas[0]);

        /**************** widget properties *********************/
        var widget = editor.getLayout().getFocusedWidget();
        var widgetProperty = widget ? {
            type: widget.mTypeName,
            top: widget.mTop,
            left: widget.mLeft,
            width: widget.mWidth,
            height: widget.mHeight
        } : {
            type: '', top: 0, left: 0, width: 0, height: 0
        };
        $('#layout-editor-wrapper .layout-editor-widget-properties')
            .html(templates.layout_edit_widget_property(widgetProperty));
        if (!widget) {
            $('#layout-editor-wrapper .layout-editor-widget-properties').addClass('none');
        }

    }

    /**
     * 注册事件
     */
    function registerEventListeners() {
        $('#layout-editor-wrapper input').change(onInputChanged);
        $('#layout-editor-wrapper .btn-add-widget').click(onAddWidget);
        $('#layout-editor-wrapper .btn-layout-editor-background').click(function () {
            alert('资源列表还未实现');
        });
        $('#layout-editor-wrapper .btn-layout-editor-delete-widget').click(function () {
            editor.getLayout().deleteWidget(editor.getLayout().getFocusedWidget());
        });
        $('#layout-editor-wrapper .btn-layout-editor-zindex-decrease').click(function () {
            editor.getLayout().getFocusedWidget().move(-1);
        });
        $('#layout-editor-wrapper .btn-layout-editor-zindex-increase').click(function () {
            editor.getLayout().getFocusedWidget().move(1);
        });
        editor.onFocusChanged(onFocusedWidgetChanged);
        editor.onWidgetsChanged(onWidgetsListUpdate);
        $('#layout-editor-wrapper .btn-layout-editor-back').click(function () {
            $('#edit-page-container').html('').addClass('none');
            location.hash = '#layout/list';
        });
        $('#layout-editor-wrapper .btn-layout-editor-save').click(onSaveLayout);

    }

    /**
     * 保存布局数据
     */
    function onSaveLayout() {
        /********** 保存布局数据 ***********/
        /********** 新增布局数据 **************/
        var json = editor.getLayout().toJSON(), data;
        data = {
            project_name: config.projectName,
            data: {
                layout_id: String(json.id),
                Name: json.name,
                Name_eng: json.nameEng,
                Width: String(json.width),
                Height: String(json.height),
                BackgroundPic: String(json.backgroundImage.id === -1 ? 0: json.backgroundImage.id),
                BackgroundColor: json.backgroundColor,
                TopMargin: String(json.topMargin),
                RightMargin: String(json.rightMargin),
                LeftMargin: String(json.leftMargin),
                BottomMargin: String(json.bottomMargin)
            }
        };
        data.action = data.id !== -1 ? 'update' : 'add';
        util.ajax('post', requestUrl + '/backend_mgt/v1/layout', JSON.stringify(data), function (res) {
            console.log(res);
            /************** 新建控件时返回id ******************/
            if (res.ID) {
                json.id = res.ID;
            }
            /************* 删除控件*****************/
            var removed = [];
            oldWidgetIds.forEach(function (id) {
                var contain = false;
                json.widgets.forEach(function (el) {
                    if (el.id === id) {
                        contain = true;
                    }
                });
                if (!contain) {
                    removed.push(id);
                }
            });
            oldWidgetIds = [];
            json.widgets.forEach(function (el) {
                oldWidgetIds.push(el.id);
            });
            var successCount = 0;
            removed.forEach(function (el) {
                util.ajax('post', requestUrl + '/backend_mgt/v1/layout', JSON.stringify({project_name: projectName, action: 'deleteLCB', data: {layout_controlbox_id: String(el)}}), function (res) {
                    console.log(res);
                    successCount++;
                    if (successCount === removed.length) {
                        update();
                    }
                });
            });
            if (removed.length === 0) {
                update();
            }
            
            function update() {
                /************* 新增控件 ****************/
                var newWidgets = [],
                    oldWidgets = [],
                    zIndex = 0,
                    newWidgetsCount;
                json.widgets.forEach(function (el) {
                    if (el.id === -1) {
                        newWidgets.push({
                            Left: String(el.left),
                            Width: String(el.width),
                            Top: String(el.top),
                            Height: String(el.height),
                            layout_id: String(json.id),
                            layout_controlbox_id: String(el.id),
                            Type: String(el.type),
                            Zorder: String(zIndex)
                        });
                    } else {
                        oldWidgets.push({
                            Left: el.left,
                            Width: el.width,
                            Top: el.top,
                            Height: el.height,
                            layout_id: String(json.id),
                            layout_controlbox_id: String(el.id),
                            Type: String(el.type),
                            Zorder: String(zIndex)
                        });
                    }
                    zIndex++;
                });
                newWidgetsCount = newWidgets.length;
                if (newWidgetsCount === 0) {
                    var data = {
                        project_name: config.projectName,
                        action: 'updateCBLList',
                        data: {
                            layout_id: String(json.id),
                            Name: json.name,
                            Name_eng: json.nameEng,
                            Width: String(json.width),
                            Height: String(json.height),
                            BackgroundPic: String(json.backgroundImage.id),
                            BackgroundColor: json.backgroundColor,
                            TopMargin: json.topMargin,
                            LeftMargin: json.leftMargin,
                            RightMargin: json.rightMargin,
                            BottomMargin: json.bottomMargin,
                            Layout_ControlBoxs: oldWidgets
                        }
                    };
                    util.ajax('post', requestUrl + '/backend_mgt/v1/layout', JSON.stringify(data), function (res) {
                        alert('保存成功');
                        console.log(res);
                    });
                } else {
                    newWidgets.forEach(function (el) {
                        var data = {
                            project_name: config.projectName,
                            action: 'addLCB',
                            data: el
                        };
                        util.ajax('post', requestUrl + '/backend_mgt/v1/layout', JSON.stringify(data), function (res) {
                            console.log(res);
                            newWidgetsCount--;
                            if (newWidgetsCount === 0) {
                                var data = {
                                    project_name: config.projectName,
                                    action: 'updateCBLList',
                                    data: {
                                        layout_id: String(json.id),
                                        Name: json.name,
                                        Name_eng: json.nameEng,
                                        Width: String(json.width),
                                        Height: String(json.height),
                                        BackgroundPic: String(json.backgroundImage.id),
                                        BackgroundColor: json.backgroundColor,
                                        TopMargin: json.topMargin,
                                        LeftMargin: json.leftMargin,
                                        RightMargin: json.rightMargin,
                                        BottomMargin: json.bottomMargin,
                                        Layout_ControlBoxs: oldWidgets
                                    }
                                };
                                util.ajax('post', requestUrl + '/backend_mgt/v1/layout', JSON.stringify(data), function (res) {
                                    alert('保存成功');
                                    console.log(res);
                                });
                            }
                        });
                    });
                }
            }
            

        });

    }

    /**
     * 更新widget列表
     */
    function onWidgetsListUpdate() {
        var videoOrAudioWidgetExists = false,
            widgets = [];
        editor.getLayout().mWidgets.forEach(function (el, idx, arr) {
            if (el.mType === 'VideoBox' || el.mType === 'AudioBox') {
                videoOrAudioWidgetExists = true;
            }
            widgets.push({
                name: el.mTypeName
            });
        });
        $('#layout-editor-wrapper .btn-add-widget[data-widget-id="video"]').prop('disabled', videoOrAudioWidgetExists);
        $('#layout-editor-wrapper .btn-add-widget[data-widget-id="audio"]').prop('disabled', videoOrAudioWidgetExists);
        $('#layout-editor-wrapper .layout-editor-widgets')
            .html(templates.layout_edit_widgets({widgets: widgets}));
    }

    /**
     * 更新widget 属性列表
     */
    function onFocusedWidgetChanged() {
        var widgetProperties = $('#layout-editor-wrapper .layout-editor-widget-properties input'),
            focusedWidget = editor.getLayout().getFocusedWidget();
        widgetProperties[0].value = focusedWidget ? focusedWidget.mTypeName : '';
        widgetProperties[1].value = focusedWidget ? focusedWidget.mTop: 0;
        widgetProperties[2].value = focusedWidget ? focusedWidget.mLeft : 0;
        widgetProperties[3].value = focusedWidget ? focusedWidget.mWidth : 0;
        widgetProperties[4].value = focusedWidget ? focusedWidget.mHeight : 0;
    }

    function onAddWidget(ev) {
        var widgetId = this.getAttribute('data-widget-id');
        var json = {
            top: 0,
            left: 0,
            width: 100,
            height: 100,
            id: -1
        };
        switch (widgetId) {
            case 'image':
                json.type = 'ImageBox';
                json.typeName = '图片控件';
                break;
            case 'video':
                json.type = 'VideoBox';
                json.typeName = '视频控件';
                break;
            case 'audio':
                json.type = 'AudioBox';
                json.typeName = '音频控件';
                break;
            case 'html':
                json.type = 'WebBox';
                json.typeName = 'Web文本控件';
                break;
            case 'clock':
                json.type = 'ClockBox';
                json.typeName = '时钟控件';
                break;
        }
        var widget = layoutEditor.Widget.create(json, editor.getLayout());
        editor.getLayout().addWidget(widget);
        widget.requestFocus();
    }

    /**
     * 处理输入框改变事件
     * @param ev
     */
    function onInputChanged(ev) {
        var propertyId = this.getAttribute('data-property-id'),
            focusedWidget = editor.getLayout().getFocusedWidget();
        switch (propertyId) {
            case 'layout-width':
                if (!editor.getLayout().setWidth(Number(this.value))) {
                    this.value = editor.getLayout().getWidth();
                }
                break;
            case 'layout-height':
                if (!editor.getLayout().setHeight(Number(this.value))) {
                    this.value = editor.getLayout().getHeight();
                }
                break;
            case 'layout-bg-color':
                editor.getLayout().setBackgroundColor(this.value);
                break;
            case 'layout-name':
                editor.getLayout().setName(this.value);
                break;
            case 'widget-top':
                if (focusedWidget && !focusedWidget.setTop(Number(this.value))) {
                    this.value = focusedWidget.getTop();
                }
                break;
            case 'widget-left':
                if (focusedWidget && !focusedWidget.setLeft(Number(this.value))) {
                    this.value = focusedWidget.getLeft();
                }
                break;
            case 'widget-width':
                if (focusedWidget && !focusedWidget.setWidth(Number(this.value))) {
                    this.value = focusedWidget.getWidth();
                }
                break;
            case 'widget-height':
                if (focusedWidget && !focusedWidget.setHeight(Number(this.value))) {
                    this.value = focusedWidget.getHeight();
                }
                break;
        }
    }

});
