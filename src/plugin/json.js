define(['jsoneditor'], function (jsoneditor) {
    loadCss('/plugin/dependence/jsoneditor.css');

    var jsonCodeHandler = function(container) {
        // create the editor
        this.editor = new jsoneditor.JSONEditor($(container)[0], {
            mode: 'view'
        });
    };
    jsonCodeHandler.prototype = {
        renderCode: function(code) {
            this.editor.set(JSON.parse(code));
        },
        destroy: function() {
            this.editor.set({});
        }
    };
    return jsonCodeHandler;
});