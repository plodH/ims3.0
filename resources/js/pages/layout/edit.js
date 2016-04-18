'use strict';

define(function(require, exports, module) {
	
	var templates = require('common/templates'),
		config    = require('common/config'),
		util      = require('common/util'),
        layoutEditor    = require('common/layout_editor');

    var requestUrl  = config.serverRoot,
        projectName = config.projectName,
        layoutId    = -1,
        editor      = null;
		
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
            util.ajax('post', requestUrl + '/backend_mgt/v1/layout', data, render);
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
            render(defaultLayout);
        }
	};

    function render(json) {
        var widgets = [];
        json.Layout_ControlBoxs.sort(function (a, b) {
            return a.Zorder - b.Zorder;
        });
        json.Layout_ControlBoxs.forEach(function (el, idx, arr) {
            widgets.push({
                name: el.Type_Name
            })
        });
        var layoutProperties = {
            name: json.Name,
            width: json.Width,
            height: json.Height,
            background_color: json.BackgroundColor
        };

        // main //
        $('#edit-page-container')
            .html(templates.layout_edit_main({}))
            .removeClass('none');
        
        // layout properties //
        $('#layout-editor-wrapper .layout-editor-properties')
            .html(templates.layout_edit_property(layoutProperties));
        
        // layout widgets list //
        $('#layout-editor-wrapper .layout-editor-widgets')
            .html(templates.layout_edit_widgets({widgets: widgets}));

        var canvas = $('#layout-editor-wrapper .layout-editor-canvas'),
            canvasHeight = canvas.height(),
            canvasWidth = canvas.width();
        editor = new layoutEditor.LayoutEditor(json, canvasWidth, canvasHeight);
        editor.attachToDOM(canvas[0]);
        
        // widget properties //
        var widget = json.Layout_ControlBoxs[0];
        var widgetProperty = widget ? {
            type: widget.Type_Name,
            top: widget.Top,
            left: widget.Left,
            width: widget.Width,
            height: widget.Height,
            zIndex: widget.Zorder
        } : {
            type: '',
            top: 0, left: 0, width: 0, height: 0, zIndex: 0
        };
        $('#layout-editor-wrapper .layout-editor-widget-properties')
            .html(templates.layout_edit_widget_property(widgetProperty));
        if (!widget) {
            $('#layout-editor-wrapper .layout-editor-widget-properties').addClass('none');
        }
        
        registerEventListeners();
        
    }
    
    function registerEventListeners() {
        $('#layout-editor-wrapper input').change(onInputChanged);
        $('#layout-editor-wrapper .btn-add-widget').click(onAddWidget);
        editor.getLayout().onFocusedWidgetChanged(onUpdateFocusedWidget);
    }

    function onUpdateFocusedWidget() {
        var widgetProperties = $('#layout-editor-wrapper .layout-editor-widget-properties li'),
            focusedWidget = editor.getLayout().getFocusedWidget();
        widgetProperties[0].value = focusedWidget ? focusedWidget.mTypeName :'';
        widgetProperties[1].value = focusedWidget ? focusedWidget.mTop: 0;
        widgetProperties[2].value = focusedWidget ? focusedWidget.mLeft : 0;
        widgetProperties[3].value = focusedWidget ? focusedWidget.mWidth: 0;
        widgetProperties[4].value = focusedWidget ? focusedWidget.mHeight : 0;
    }

    function onAddWidget(ev) {
        var widgetId = this.getAttribute('data-widget-id');
        var json = {
            Top: 0,
            Left: 0,
            Width: 100,
            Height: 100
        };
        switch (widgetId) {
            case 'image':
                json.Type = 'ImageBox';
                json.Type_Name = '图片控件';
                break;
            case 'video':
                json.Type = 'VideoBox';
                json.Type_Name = '视频控件';
                break;
            case 'audio':
                json.Type = 'AudioBox';
                json.Type_Name = '音频控件';
                break;
            case 'html':
                json.Type = 'WebBox';
                json.Type_Name = 'Web文本控件';
                break;
            case 'clock':
                json.Type = 'ClockBox';
                json.Type_Name = '时钟控件';
                break;
        }
        var widget = layoutEditor.Widget.createByJSON(json, editor, editor.getLayout());
        editor.getLayout().addWidget(widget);
        widget.requestFocus();
    }

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
