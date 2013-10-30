var frameUrl = new Uri(location.href);
var originUrl = new Uri(decodeURIComponent(frameUrl.getQueryParamValue('url')));


(function initNav() {
    var inputUrl = $('.j-input-url'),
        btnGo = $('.j-go'),
        btnClose = $('.j-close-iframe'),
        btnNewWindow = $('.j-new-window');
    inputUrl.val(originUrl.toString());
    inputUrl.on('input', function(){
        btnGo.data('original-title', '前往');
        btnGo.find('.glyphicon').removeClass('glyphicon-refresh').addClass('glyphicon-play');
    });
    btnGo.click(function(){
        btnGo.data('original-title', '刷新');
        btnGo.find('.glyphicon').addClass('glyphicon-refresh').removeClass('glyphicon-play');
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

(function($) {

    $.escapeHTML = function(s) {
        return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
    };
    $.unescapeHTML = function(s){
        return s.replace(/&amp;/g,'&')
            .replace(/&lt;/g,'<')
            .replace(/&gt;/g,'>')
            .replace(/&nbsp;/g,' ')
            .replace(/&quot;/g, "\"");
    };

})($);

var CODE_SPLIT_REG = /((.*\n){50}|[\s\S]+$)/g; //按50行一个代码块分割代码

Prism.hooks.add('before-insert', function(env) {
    env.highlightedCodeArray = env.highlightedCode.match(CODE_SPLIT_REG);
    env.codeArray = env.code.match(CODE_SPLIT_REG);
    env.highlightedCode = ''; //阻止prism默认innerHTML大量dom
});
Prism.hooks.add('after-highlight', function(env) {
    var timeout, i = 0, t = Date.now();
    function clearTextNode(startNode) {
        if (!startNode) return;
        var nextNode = startNode.nextSibling;
        if (nextNode) {
            clearTextNode(nextNode);
            nextNode.remove();
            nextNode = null;
        }
    }
    function appendCode() {
        timeout = window.setTimeout(function(){
            var html = (i?'\n':'') + env.highlightedCodeArray[i] + env.codeArray.slice(i+1).join('');
            clearTextNode(env.element.lastElementChild);
            $(env.element).append(html);
            if (i < env.highlightedCodeArray.length - 1) {
                i++;
                appendCode();
            }
        }, 50);
    }
    function lazyRenderCode() {
        if (i < env.highlightedCodeArray.length - 1) {
            if (timeout) {
                window.clearTimeout(timeout);
            }
            appendCode();
        }
        else {
            $(window).off('mousemove.'+t+' keydown.'+t, lazyRenderCode);
            $('#code-wrapper').off('scroll.'+t, lazyRenderCode);
        }
    }
    $(window).on('mousemove.'+t+' keydown.'+t, lazyRenderCode);
    $('#code-wrapper').on('scroll.'+t, lazyRenderCode);
    appendCode();
});

getKey(function(key) {
    originUrl.replaceQueryParam(PARAM_KEY, key)
    var dataUrl = originUrl.toString();
    $.get(dataUrl,function(data){
        $('#code').html($.escapeHTML(data));
        Prism.highlightAll();
    });
});
