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
                LeftMargin: '0'
            };
            render(defaultLayout);
        }
	};

    function render(json) {
        var data = {
            name: json.Name,
            width: json.Width,
            height: json.Height,
            background_color: json.BackgroundColor,
            background_image: JSON.stringify(json.BackgroundPic)
        };
        $('#edit-page-container')
            .html(templates.layout_edit_main(data))
            .removeClass('none');
    }
	
});
