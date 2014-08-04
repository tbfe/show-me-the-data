define(['jsoneditor', 'ace', 'cache', 'uri', 'FileSaver'], function(jsoneditor, ace, cache, Uri, saveAs) {
    loadCss('/plugin/dependence/jsoneditor/jsoneditor.css');

    var jsonCodeHandler = function(options) {
        this.originalCode = '';
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
                '<div class="btn-group btn-group-sm j-radio-view-mode" data-toggle="buttons">' +
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
                '<div class="btn-group btn-group-sm">' +
                '<button class="btn btn-default j-revert-all" data-toggle="tooltip" title="撤销所有更改"  type="button">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
                '</button>' +
                '<button class="btn btn-default j-export-json" data-toggle="tooltip" title="导出"  type="button">' +
                '<span class="glyphicon glyphicon-save"></span>' +
                '</button>' +
                '<button class="btn btn-default j-import-json" data-toggle="tooltip" title="导入"  type="button">' +
                '<span class="glyphicon glyphicon-folder-open"></span>' +
                '</button>' +
                '</div>' +
                '<input type="file" class="j-file-upload" style="display:none"/>' +
                '</div>');
            this.modeController.appendTo(this.container).button();
            this.modeController.find('.btn').tooltip({
                container: 'body',
                placement: 'top'
            });
            this.modeController.find('.j-radio-view-mode input:radio').change(function(e) {
                var data = self.getValidJson();
                if (data === false) {
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
            //初始化撤销
            this.modeController.on('click', '.j-revert-all', function() {
                self._renderCode(self.originalCode);
            });
            //初始化导出导入json按钮
            this.modeController.on('click', '.j-export-json', function() {
                var json = self.getValidJson();
                if (json === false) {
                    return;
                }
                var blob = new Blob([JSON.stringify(json)], {
                    type: 'text/plain'
                });
                saveAs(blob, url + '.' + new Date().toJSON() + '.json');
            });
            this.modeController.on('change', '.j-file-upload', function(e) {
                var selectedFile = e.target.files[0];
                var reader = new FileReader();
                reader.onload = (function(file) {
                    return function(e) {
                        console.log(e.target.result);
                        self._renderCode(e.target.result);
                    };
                })(selectedFile);
                reader.readAsText(selectedFile);
            });
            this.modeController.on('click', '.j-import-json', function() {
                self.modeController.find('.j-file-upload').trigger('click');
            });
        },
        setMode: function(mode) {
            this.modeController.find('input[value=' + mode + ']').click();
        },
        setJson: function(json) {
            var result;
            if (typeof json === 'string') {
                json = JSON.parse(json);
            }
            try {
                result = this.editor.set(json);
            } catch (e) {
                alert('JSON invalid.');
                return false;
            }
            return result;
        },
        getValidJson: function() {
            var __data;
            try {
                __data = this.editor.get();
            } catch (e) {
                alert("JSON invalid.");
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
                });
            }
            this.previewForm.find('input[name=__data]').val(JSON.stringify(data));
            this.previewForm[0].submit();
            loading();
        },
        renderCode: function(code) {
            this.originalCode = code;
            this._renderCode(code);
        },
        _renderCode: function(code) {
            var mode = this.modeController.find('input:radio:checked').val();
            if (mode === 'preview') {
                this.setMode('edit');
            }
            this.setJson(code);
        },
        destroy: function() {
            this.container.empty();
        }
    };
    return jsonCodeHandler;
});