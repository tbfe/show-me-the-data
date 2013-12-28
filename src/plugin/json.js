define(['jsoneditor', 'ace'], function(jsoneditor, ace) {
    loadCss('/plugin/dependence/jsoneditor/jsoneditor.css');
    loadCss

    var jsonCodeHandler = function(container) {
        // create the editor
        this.container = $(container);
        this.editor = new jsoneditor.JSONEditor(this.container[0], {
            mode: 'form',
            modes: ['code', 'form']
        });
    };
    jsonCodeHandler.prototype = {
        renderCode: function(code) {
            this.editor.set(JSON.parse(code));
        },
        destroy: function() {
            this.container.empty();
        }
    };
    return jsonCodeHandler;
});