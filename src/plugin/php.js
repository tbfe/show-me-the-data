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

	var CODE_SPLIT_REG = /((.*\n){50}|[\s\S]+$)/g; //按50行一个代码块分割代码

    var phpCodeHandler = function(container) {
    	this.container = $(container);
    	this.container.html('<pre id="code-wrapper"><code class="language-php" id="code"></code></pre>');
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
    };
    phpCodeHandler.prototype = {
    	renderCode: function(code) {
    		this.container.find('#code').html($.escapeHTML(code));
			Prism.highlightAll();
    	},
    	destroy: function() {

    	}
    }
    return phpCodeHandler;
});