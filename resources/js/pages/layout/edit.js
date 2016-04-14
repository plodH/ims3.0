'use strict';

define(function(require, exports, module) {
	
	var templates = require('common/templates'),
		config    = require('common/config'),
		util      = require('common/util');

    var requestUrl  = 'http://192.168.18.166',
        projectName = 'develop',
        layoutId    = -1;
		
	exports.init = function() {
		layoutId = util.getHashParameters().id;
        if (typeof(layoutId) === 'number') {
            var data = JSON.stringify({
                project_name: projectName,
                action: 'get',
                data: {
                    layout_id: layoutId
                }
            });
            util.ajax('post', requestUrl + '/backend_mgt/v1/layout', data, function (layoutData) {
                var data = JSON.stringify({
                    project_name: projectName,
                    action: 'getCBList',
                    data: {
                        layout_id: String(layoutId)
                    }
                });
                util.ajax('post', requestUrl + '/backend_mgt/v1/layout', data, function (widgetData) {
                    render(layoutData, widgetData);
                });
            });
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
                LeftMargin: '0'
            };
            var defaultWidget = {
                
            };
            render(defaultLayout, defaultWidget);
        }
	};

    function render(layout, widget) {
        var data = {
            name: layout.Name,
            width: layout.Width,
            height: layout.Height,
            background_color: layout.BackgroundColor,
            background_image: JSON.stringify(layout.BackgroundPic)
        };
        $('#edit-page-container')
            .html(templates.layout_edit_main(data))
            .removeClass('none');
        widget
    }
	
});
