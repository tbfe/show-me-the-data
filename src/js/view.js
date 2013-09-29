(function($) {

    $.escapeHTML = function(s) {
        return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/ /g, '&nbsp;')
            .replace(/"/g, "&quot;");
    };
    $.unescapeHTML = function(s){
        return s.replace(/&amp;/g,'&')
            .replace(/&lt;/g,'<')
            .replace(/&gt;/g,'>')
            .replace(/&nbsp;/g,' ')
            .replace(/&quot;/g, "\"");
    };

})(Zepto);

var frameUrl = new Uri(location.href);
var dataUrl = decodeURIComponent(frameUrl.getQueryParamValue('url'));
$.get(dataUrl,function(data){
    $('#code').html($.escapeHTML(data));
    Prism.highlightAll();
});