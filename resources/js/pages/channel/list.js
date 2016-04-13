'use strict';

define(function(require, exports, module) {

    // depend on these components
    var templates = require('common/templates'),
        config    = require('common/config'),
        util      = require('common/util');

    // global variables
    var requestUrl    = 'http://192.168.18.166',
        projectName   = 'develop',
        nDisplayItems = 25;

    // 初始化页面
	exports.init = function() {
        loadPage(1);
        registerEventListeners();
    };

    function registerEventListeners() {
        $('#channel-table').delegate('input[type="checkbox"]', 'click', function (ev) {
        });
        $('#channel-table').delegate('tr', 'click', function (ev) {
        });
        $('#channel-table').delegate('.btn-channel-detail', 'click', function (ev) {
        });
        $('#channel-list-controls .select-all').click(function (ev) {
        });
        $('#channel-list-controls .btn-publish').click(function (ev) {
        });
        $('#channel-list-controls .btn-publish-later').click(function (ev) {
        });
        $('#channel-list-controls .btn-copy').click(function (ev) {
        });
        $('#channel-list-controls .btn-delete').click(function (ev) {
        });

    }

    // 加载页面数据
    function loadPage(pageNum) {
        var pager = {
            page: String(pageNum),
            total: '0',
            per_page: String(nDisplayItems),
            orderby: 'ID',
            sortby: '',
            keyword: ''
        };
        var data = JSON.stringify({
            Action: 'GetPage',
            Project: projectName,
            Pager: pager
        });
        util.ajax('post', requestUrl + '/backend_mgt/v1/channels', data, function (res) {
            render(res);
        });
    }

    // 渲染界面
    function render(json) {

        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        $('#channel-table-pager').jqPaginator({
            totalPages: totalPages,
            visiblePages: 10,
            currentPage: Number(json.Pager.page),
            onPageChange: function (num, type) {
                if (type === 'change') {
                    loadPage(num);
                }
            }
        });

        $('#channel-table>tbody').html('');
        json.Channels.forEach(function (el, idx, arr) {
            var schedule_type = el.Overall_Schedule_Type === 'Regular' ? '常规' : '定时';
            var schedule_params = {
                'Sequence': '顺序',
                'Percent': '比例',
                'Random': '随机'
            }[el.Overall_Schedule_Paras.Type];
            schedule_params = schedule_params ? schedule_params : '其它';
            var data = {
                id: el.ID,
                name: el.Name,
                schedule_type: schedule_type,
                schedule_params: schedule_params,
                version: el.Version
            };
            $('#channel-table>tbody').append(templates.channel_table_row(data));
        });

        $('#channel-table input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue'
        });

    }
	
});
