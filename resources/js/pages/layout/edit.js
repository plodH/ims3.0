'use strict';

define(function(require, exports, module) {
	
	var templates = require('common/templates'),
		config    = require('common/config'),
		util      = require('common/util'),
        layoutEditor    = require('common/layout_editor');

    var requestUrl  = 'http://192.168.18.166',
        projectName = 'develop',
        layoutId    = -1,
        layout      = null;
		
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
        var property = {
            name: json.Name,
            width: json.Width,
            height: json.Height,
            background_color: json.BackgroundColor,
            background_image: json.BackgroundPic.url
        };

        $('#edit-page-container')
            .html(templates.layout_edit_main({}))
            .removeClass('none');
        $('#layout-editor-wrapper .layout-editor-properties')
            .html(templates.layout_edit_property(property));
        $('#layout-editor-wrapper .layout-editor-widgets')
            .html(templates.layout_edit_widgets({widgets: widgets}));
        if (json.Layout_ControlBoxs.length > 0) {
            var widget = json.Layout_ControlBoxs[0];
            var widgetType = {
                ClockBox: 'clock',
                VideoBox: 'video',
                WebBox: 'html',
                ImageBox: 'image'
            }[widget.Type];
            var widgetProperty = {
                type: widgetType,
                top: widget.Top,
                left: widget.Left,
                width: widget.Width,
                height: widget.Height,
                zIndex: widget.Zorder
            };
            $('#layout-editor-wrapper .layout-editor-widget-properties')
                .html(templates.layout_edit_widget_property(widgetProperty));
        }
        var canvasWidth = $('#layout-editor-wrapper .layout-editor-canvas').width();
        var canvasHeight = $('#layout-editor-wrapper .layout-editor-canvas').height();
        var fitXFactor = canvasWidth / json.Width;
        var fitYFactor = canvasHeight / json.Height;
        var zoomFactor = Math.min(fitXFactor, fitYFactor);
        layout = layoutEditor.Layout.createByJSON(json, zoomFactor);
        layout.displayOn($('#layout-editor-wrapper .layout-editor-canvas')[0]);
    }

});
