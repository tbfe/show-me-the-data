define(['jsoneditor'], function (jsoneditor) {
    loadCss('/plugin/dependence/jsoneditor.css');

    var jsonCodeHandler = function(container) {
        // create the editor
        this.container = $(container);
        this.editor = new jsoneditor.JSONEditor(this.container[0], {
            mode: 'view'
        });
    };
    jsonCodeHandler.prototype = {
        renderCode: function(code) {
            this.editor.set(JSON.parse(code));
        },
        destroy: function() {
            this.editor.clear();
            this.container.empty();
        }
    };
    return jsonCodeHandler;
});