requirejs.config({
    paths: {
       prism: "/plugin/dependence/prism",
    },
    shim: {
        'prism': {
            "exports": "Prism"
        }
    }
});

var frameUrl = new Uri(location.href);
var initUrl = new Uri(decodeURIComponent(frameUrl.getQueryParamValue('url'))),

codeManager = {
    _codeHandler: undefined,
    renderCode: function(code) {
        getKey(function(key) {
            this._codeHandler && this._codeHandler.renderCode(code);
        });
    },
    initCodeHandler: function(language) {
        var self = this;
        language = language || 'php';
        require(['/plugin/'+language+'.js'], function(codeHandler){
            self._codeHandler && self._codeHandler.destroy();
            self._codeHandler = new codeHandler('.j-code-wrapper');
        });
    },
    fetchCode: function(url) {
        var self = this;
        url = new Uri(url);
        getKey(function(key) {
            url.replaceQueryParam(PARAM_KEY, key)
            var dataUrl = url.toString();
            $.get(dataUrl, function(data){
                self._codeHandler.renderCode(data);
            });
        });
    }
};

//首次代码加载
codeManager.initCodeHandler();
codeManager.fetchCode(initUrl.toString());

//初始化地址栏
(function initNav() {
    var inputUrl = $('.j-input-url'),
        btnGo = $('.j-go'),
        btnClose = $('.j-close-iframe'),
        btnNewWindow = $('.j-new-window');
    inputUrl.val(initUrl.toString());
    inputUrl.on('input', function(){
        btnGo.attr('data-original-title', '前往');
        btnGo.find('.glyphicon').removeClass('glyphicon-refresh').addClass('glyphicon-play');
    });
    $('.j-nav-form').on('submit', function(e){
        e.preventDefault();
        btnGo.attr('data-original-title', '刷新');
        btnGo.find('.glyphicon').addClass('glyphicon-refresh').removeClass('glyphicon-play');
        codeManager.fetchCode(inputUrl.val());
    });
    $('.nav').button();
    $('.nav .btn').tooltip({
        container: 'body',
        placement: 'bottom'
    });

    $('.j-close-iframe').click(function(){
        window.parent.postMessage({data:'1',code:'close'},'*');
    })
    $('.j-new-window').click(function(){
        window.parent.postMessage({
            data:{
                url: inputUrl.val()
            },
            code:'newtab'
        },'*');
    })
})();


function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}