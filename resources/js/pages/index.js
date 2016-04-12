define(function (require, exports, module) {


    exports.init = function () {

        loadPage();

        window.onhashchange = function () {
            loadPage();
        }

    };

    function loadPage() {

        var page = window.location.hash.match(/^#([^?]*)/);
        page = page === null ? 'terminal/list' : page[1];

        // load页面
        $('#page_box').load('resources/pages/' + page + '.html');

        //登出
        $("#logout").click(function () {
            window.location.href = "login.jsp";
        });
    }

});