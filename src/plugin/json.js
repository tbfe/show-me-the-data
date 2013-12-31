define(['jsoneditor', 'ace', 'cache', 'uri'], function(jsoneditor, ace, cache, Uri) {
    loadCss('/plugin/dependence/jsoneditor/jsoneditor.css');

    var jsonCodeHandler = function(options) {
        // create the editor
        this.container = $(options.container);
        this.editor = new jsoneditor.JSONEditor(this.container[0], {
            mode: 'form'
        });
        this.initModeController(options.url);
    };
    jsonCodeHandler.prototype = {
        initModeController: function(url) {
            var self = this;
            this.modeController = $(
                '<div class="control-wrapper">' +
                '<div class="btn-group j-radio-view-mode" data-toggle="buttons">' +
                '<label class="btn btn-default" data-toggle="tooltip" title="编辑">' +
                '<input type="radio" name="view-mode" value="edit"><span class="glyphicon glyphicon-edit"></span>' +
                '</label>' +
                '<label class="btn btn-default" data-toggle="tooltip" title="高级编辑">' +
                '<input type="radio" name="view-mode" value="advanced-edit"><span class="glyphicon glyphicon-list"></span>' +
                '</label>' +
                '<label class="btn btn-default" data-toggle="tooltip" title="预览">' +
                '<input type="radio" name="view-mode" value="preview"><span class="glyphicon glyphicon-play"></span>' +
                '</label>' +
                '</div>' +
                '</div>');
            this.modeController.appendTo(this.container).button();
            this.modeController.find('.btn').tooltip({
                container: 'body',
                placement: 'bottom'
            });
            this.modeController.find('input:radio').change(function(e) {
                var data = self.getValidJson();
                if (data === false) {
                    alert("JSON invalid.");
                    return;
                }
                var value = $(this).attr('value');
                //hide all
                var editor = $(self.editor.frame).hide();
                var frame = (self.previewFrame || self.container.find('iframe')).hide();
                switch (value) {
                    case 'edit':
                        self.editor.setMode('form');
                        editor.show();
                        break;
                    case 'advanced-edit':
                        self.editor.setMode('code');
                        editor.show();
                        break;
                    case 'preview':
                        self.preview(url, data);
                        frame.show();
                        break;
                    default:
                        console.log('something wrong with controller');
                }
            });
            self.setMode('edit');
        },
        setMode: function(mode) {
            this.modeController.find('input[value=' + mode + ']').click();
        },
        getValidJson: function() {
            var __data;
            try {
                __data = this.editor.get();
            } catch (e) {
                return false;
            }
            return __data;
        },
        preview: function(url, data) {
            var self = this;
            if (!this.previewForm) {
                this.previewForm = $('<form method="post" target="preview" action=""><input type="hidden" name="__data"/></form>').appendTo(this.container);
                this.previewFrame = $('<iframe name="preview"></iframe>').appendTo(this.container);
                this.previewFrame.load(function() {
                    unloading();
                });
                cache.getKey(function(key) {
                    var actionUrl = new Uri(url);
                    actionUrl.replaceQueryParam(PARAM_KEY, key);
                    self.previewForm.attr('action', actionUrl.toString());
                })
            }
            this.previewForm.find('input[name=__data]').val(JSON.stringify(data));
            this.previewForm[0].submit();
            loading();
        },
        renderCode: function(code) {
            var mode = this.modeController.find('input:radio:checked').val();
            if (mode === 'preview') {
                this.setMode('edit');
            }
            this.editor.set(JSON.parse(code));
        },
        destroy: function() {
            this.container.empty();
        }
    };
    return jsonCodeHandler;
});