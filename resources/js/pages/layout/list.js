'use strict';

define(function(require, exports, module) {

	// depend on these components
	var templates = require('common/templates'),
		config    = require('common/config'),
		util      = require('common/util');

	// global variables
	var requestUrl    = config.serverRoot,
		projectName   = config.projectName,
		nDisplayItems = 10,
        keyword       = '';

	// 初始化页面
	exports.init = function() {
		loadPage(1);
		registerEventListeners();
	};

	function registerEventListeners() {
		$('#layout-table').delegate('input[type="checkbox"]', 'ifClicked', function (ev) {
			onSelectedItemChanged($(this.parentNode).hasClass('checked') ? -1 : 1);
		});
		$('#layout-table').delegate('tr', 'click', function (ev) {
			var self = this;
			$('#layout-table tr').each(function (idx, el) {
				$(el).iCheck('uncheck');
			});
			$(self).iCheck('check');
			onSelectedItemChanged();
		});
		$('#layout-table').delegate('.btn-layout-detail', 'click', function (ev) {
			var layoutId = getLayoutId(ev.target);
			console.log(layoutId);
			ev.stopPropagation();
		});
		$('#layout-list-controls .select-all').click(function (ev) {
			var hasUncheckedItems = false;
			$('#layout-table div').each(function (idx, el) {
				if (!(hasUncheckedItems || $(el).hasClass('checked'))) {
					hasUncheckedItems = true;
				}
			});
			$('#layout-table tr').each(function (idx, el) {
				$(el).iCheck(hasUncheckedItems ? 'check' : 'uncheck');
			});
			onSelectedItemChanged();
		});
        $('#channel-list-nav').keyup(function (ev) {
	            if (ev.which === 13) {
                onSearch($('#channel-list-nav input').val());
                ev.stopPropagation();
            }
        });
        $('#channel-list-nav button').click(function (ev) {
            onSearch($('#channel-list-nav input').val());
        });

    }

    function onSearch(_keyword) {
        keyword = typeof(_keyword) === 'string' ? _keyword : '';
        loadPage(1);
    }

    function onSelectedItemChanged(adjustCount) {
		var selectedCount = typeof(adjustCount) === 'number' ? adjustCount: 0;
		$('#layout-table div').each(function (idx, el) {
			if ($(el).hasClass('checked')) {
				selectedCount++;
			}
		});
		var hasUncheckedItems = selectedCount !== $('#layout-table tr').size();
		$('#layout-list-controls .select-all>i')
			.toggleClass('fa-square-o', hasUncheckedItems)
			.toggleClass('fa-check-square-o', !hasUncheckedItems);
		$('#layout-list-controls .btn-publish').prop('disabled', selectedCount !== 1);
		$('#layout-list-controls .btn-publish-later').prop('disabled', selectedCount !== 1);
		$('#layout-list-controls .btn-copy').prop('disabled', selectedCount !== 1);
		$('#layout-list-controls .btn-delete').prop('disabled', selectedCount !== 1);
	}

	function getLayoutId(el) {
		var idAttr;
		while (el && !(idAttr = el.getAttribute('data-layout-id'))) {
			el = el.parentNode;
		}
		return Number(idAttr);
	}

	function getCurrentLayoutId() {
		return Number($('#layout-table div.checked')[0].parentNode.getAttribute('data-layout-id'));
	}

	// 加载页面数据
	function loadPage(pageNum) {
		var pager = {
			page: String(pageNum),
			total: '0',
			per_page: nDisplayItems,
			orderby: 'CreateTime',
			sortby: 'DESC',
			keyword: keyword
		};
		var data = JSON.stringify({
			action: 'listPage',
			project_name: projectName,
			Pager: pager
		});
		util.ajax('post', requestUrl + '/backend_mgt/v1/layout', data, render);
	}

	// 渲染界面
	function render(json) {

		var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
		$('#layout-table-pager').jqPaginator({
			totalPages: totalPages,
			visiblePages: 10,
			first: '<li><a href="javascript:;">首页</a></li>',
			page: '<li><a href="javascript:;">{{page}}</a></li>',
			last: '<li><a href="javascript:;">尾页</a></li>',
			currentPage: Number(json.Pager.page),
			onPageChange: function (num, type) {
				if (type === 'change') {
					loadPage(num);
				}
			}
		});

		$('#layout-table>tbody').html('');
		json.LayoutList.forEach(function (el, idx, arr) {
			var data = {
				id: el.ID,
				name: el.Name,
				width: el.Width,
				height: el.Height,
				background_color: el.BackgroundColor,
				create_time: el.CreateTime
			};
			$('#layout-table>tbody').append(templates.layout_table_row(data));
		});
		onSelectedItemChanged();

		$('#layout-table input[type="checkbox"]').iCheck({
			checkboxClass: 'icheckbox_flat-blue',
			radioClass: 'iradio_flat-blue'
		});

	}

});
