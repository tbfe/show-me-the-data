define(['prism'], function(Prism) {
    loadCss('/plugin/dependence/prism/prism.css');

    function escapeForPrism(s) {
        return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/\u00a0/g, ' ');
    }

    function clearTextNode(startNode) {
        if (!startNode) return;
        var nextNode = startNode.nextSibling;
        if (nextNode) {
            clearTextNode(nextNode);
            nextNode.remove();
            nextNode = null;
        }
    }

    var CODE_SPLIT_REG = /((.*[\n|\u000d]){50}|[\s\S]+$)/g; //按50行一个代码块分割代码

    var phpCodeHandler = function(options) {
        var self = this;
        this.container = $(options.container);
        this.container.html('<div class="code-wrapper"><pre class="language-php"><code class="language-php j-code"></code></pre><div class="control-wrapper word-wrap-control-wrapper"><label class="checkbox-inline"><input type="checkbox" class="j-word-wrap-control"/>Word Wrap</label></div></div>');
        this.codeContainer = this.container.find('.j-code');
        this.renderStartTime = 0;

        this.container.on('change', '.j-word-wrap-control', function() {
            $('.code-wrapper').toggleClass('word-wrap', $(this).is(':checked'));
        });
    };
    phpCodeHandler.prototype = {
        renderCode: function(code) {
            var self = this;
            code = escapeForPrism(code);
            var highlightedCode = Prism.highlight(code, Prism.languages.php);
            var highlightedCodeArray = highlightedCode.match(CODE_SPLIT_REG);
            var codeArray = code.match(CODE_SPLIT_REG);

            var timeout, i = 0,
                renderStartTime = Date.now(); //当前闭包创建的时间
            self.renderStartTime = renderStartTime;

            function appendCode() {
                timeout = window.setTimeout(function() {
                    if (renderStartTime != self.renderStartTime) {
                        unbindEvent();
                        return; //如果当前闭包已经过时，不再继续迭代
                    }
                    var html = (i ? '\n' : '') + highlightedCodeArray[i] + codeArray.slice(i + 1).join('');
                    clearTextNode(self.codeContainer[0].lastElementChild);
                    self.codeContainer.append(html);
                    if (i < highlightedCodeArray.length - 1) {
                        i++;
                        appendCode();
                    }
                }, 50);
            }

            function lazyRenderCode() {
                if (i < highlightedCodeArray.length - 1) {
                    if (timeout) {
                        window.clearTimeout(timeout);
                    }
                    appendCode();
                } else {
                    unbindEvent();
                }
            }

            function unbindEvent() {
                $(window).off('mousemove.' + renderStartTime + ' keydown.' + renderStartTime, lazyRenderCode);
                $('.j-code-wrapper').off('scroll.' + renderStartTime, lazyRenderCode);
            }
            self.clearCode();
            $(window).on('mousemove.' + renderStartTime + ' keydown.' + renderStartTime, lazyRenderCode);
            $('.j-code-wrapper').on('scroll.' + renderStartTime, lazyRenderCode);
            appendCode();
        },
        destroy: function() {
            this.renderStartTime = 0;
            this.container.empty();
        },
        clearCode: function() {
            this.codeContainer[0].innerHTML = '';
        }
    };
    return phpCodeHandler;
});