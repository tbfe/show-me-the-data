define(['prism'], function (Prism) {
    loadCss('/plugin/dependence/prism.css');

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

    Prism.hooks.add('before-insert', function(env) {
        env.highlightedCodeArray = env.highlightedCode.match(CODE_SPLIT_REG);
        env.codeArray = env.code.match(CODE_SPLIT_REG);
        env.highlightedCode = ''; //阻止prism默认innerHTML大量dom
    });

    function clearTextNode(startNode) {
        if (!startNode) return;
        var nextNode = startNode.nextSibling;
        if (nextNode) {
            clearTextNode(nextNode);
            nextNode.remove();
            nextNode = null;
        }
    }

    var CODE_SPLIT_REG = /((.*\n){50}|[\s\S]+$)/g; //按50行一个代码块分割代码

    var phpCodeHandler = function(container) {
        //由于Prism提供的after-highlight回调无法区分是哪个实例注册的，故只提供单例支持
        if (typeof phpCodeHandler.instance === 'object') {
            return phpCodeHandler.instance;
        }
        var self = this;
        this.container = $(container);
        this.container.html('<pre id="code-wrapper"><code class="language-php" id="code"></code></pre><div class="word-wrap-control-wrapper"><label class="checkbox-inline"><input type="checkbox" class="j-word-wrap-control"/>Word Wrap</label></div>');
        
        this.renderStartTime = 0;
        Prism.hooks.add('after-highlight', function lazyRender(env) {
            var timeout, i = 0,
                renderStartTime = Date.now();//当前闭包创建的时间
            self.renderStartTime = renderStartTime;
            function appendCode() {
                timeout = window.setTimeout(function(){
                    if (renderStartTime != self.renderStartTime) {
                        unbindEvent();
                        return; //如果当前闭包已经过时，不再继续迭代
                    }
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
                    unbindEvent();
                }
            }
            function unbindEvent() {
                $(window).off('mousemove.'+renderStartTime+' keydown.'+renderStartTime, lazyRenderCode);
                $('#code-wrapper').off('scroll.'+renderStartTime, lazyRenderCode);
            }
            $(window).on('mousemove.'+renderStartTime+' keydown.'+renderStartTime, lazyRenderCode);
            $('#code-wrapper').on('scroll.'+renderStartTime, lazyRenderCode);
            appendCode();
        });
        this.container.on('change', '.j-word-wrap-control', function() {
            $('#code-wrapper').toggleClass('word-wrap', $(this).is(':checked'));
        });
    };
    phpCodeHandler.prototype = {
        renderCode: function(code) {
            this.container.find('#code').html($.escapeHTML(code));
            Prism.highlightAll();
        },
        destroy: function() {
            this.container.html('');
        }
    }
    return phpCodeHandler;
});