requirejs.config({
    paths: {
        cache: "/js/cache",
        uri: "/lib/uri",
        prism: "/plugin/dependence/prism/prism",
        ace: "/plugin/dependence/ace/ace",
        jsoneditor: "/plugin/dependence/jsoneditor/jsoneditor"
    },
    shim: {
        'prism': {
            "exports": "Prism"
        },
        'cache': {
            'exports': 'Cache'
        },
        'uri': {
            'exports': 'Uri'
        }
    }
});

require(['cache', 'uri'], function(cache, Uri) {
    var frameUrl = new Uri(location.href);
    var currentUrl = new Uri(decodeURIComponent(frameUrl.getQueryParamValue('url'))),
        currentLanguage = cache.getLanguage();
    var codeManager = {
        _codeHandler: undefined,
        renderCode: function(code) {
            cache.getKey(function(key) {
                this._codeHandler && this._codeHandler.renderCode(code);
            });
        },
        initCodeHandler: function(language, callback) {
            var self = this;
            require(['/plugin/' + language + '.js'], function(codeHandler) {
                self._codeHandler && self._codeHandler.destroy();
                self._codeHandler = new codeHandler({
                    container: '.j-code-wrapper',
                    url: currentUrl
                });
                $('.j-code-wrapper').attr('data-language', language);
                callback && callback();
            });
        },
        fetchCode: function(url) {
            var self = this;
            url = new Uri(url);
            loading();
            cache.getKey(function(key) {
                url.replaceQueryParam(PARAM_KEY, key);
                url.replaceQueryParam(LANGUAGE_KEY, cache.getLanguage());
                var dataUrl = url.toString();
                $.get(dataUrl, function(data) {
                    self._codeHandler && self._codeHandler.renderCode(data);
                    unloading();
                });
            });
        }
    };

    //首次代码加载
    codeManager.initCodeHandler(cache.getLanguage(), function() {
        codeManager.fetchCode(currentUrl.toString());
    });

    //初始化地址栏
    (function initNav() {
        var inputUrl = $('.j-input-url'),
            btnGo = $('.j-go'),
            btnClose = $('.j-close-iframe'),
            btnNewWindow = $('.j-new-window'),
            radioLanguage = $('.j-radio-language input:radio');
        //初始化地址栏
        inputUrl.val(currentUrl.toString());
        inputUrl.on('input', function() {
            btnGo.attr('data-original-title', '前往');
            btnGo.find('.glyphicon').removeClass('glyphicon-refresh').addClass('glyphicon-play');
        });
        $('.j-nav-form').on('submit', function(e) {
            e.preventDefault();
            btnGo.attr('data-original-title', '刷新');
            btnGo.find('.glyphicon').addClass('glyphicon-refresh').removeClass('glyphicon-play');
            var url = inputUrl.val();
            codeManager.fetchCode(url);
            currentUrl = new Uri(url);
        });
        $('.nav').button();
        $('.nav .btn').tooltip({
            container: 'body',
            placement: 'bottom'
        });
        //初始化language选择
        radioLanguage.filter('[value="' + currentLanguage + '"]').click();
        radioLanguage.change(function(e) {
            var targetLanguage = $(this).attr('value');
            if (targetLanguage === currentLanguage) return;
            currentLanguage = targetLanguage;
            cache.setLanguage(targetLanguage);
            codeManager.initCodeHandler(targetLanguage, function() {
                codeManager.fetchCode(currentUrl.toString());
            });
        })
        //初始化关闭浮层
        function closeIframe() {
            window.parent.postMessage({
                data: '1',
                code: 'close'
            }, '*');
        }
        btnClose.click(closeIframe)
        $(document).keyup(function(e) {
            if (e.keyCode == 27) {
                closeIframe();
            }
        });
        //初始化新窗口打开
        btnNewWindow.click(function() {
            window.parent.postMessage({
                data: {
                    url: inputUrl.val()
                },
                code: 'newtab'
            }, '*');
            btnNewWindow.attr('data-original-title', '下次试试双击 { }');
        })
    })();
});

function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}

function loading() {
    $('.loading').show();
    //锦上添花的功能，直接列举可能的情况，没有解耦
    $('.loading-blur').removeClass('loading-blur');
    $('.j-code-wrapper[data-language="php"] .j-code, .j-code-wrapper[data-language="json"] .jsoneditor, .j-code-wrapper[data-language="json"] iframe[name="preview"]').addClass('loading-blur');
}

function unloading() {
    $('.loading').hide();
    $('.loading-blur').removeClass('loading-blur');
}