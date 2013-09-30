var View = View;

if (View === undefined) {
    var VIEW_STATU_SHOW = 2,
        VIEW_STATU_MIN = 1,
        VIEW_STATU_HIDE = 0;
    var VIEW_IFRAME_URL = chrome.extension.getURL("page/view.html");

    View = function(url) {
        if (typeof View.instance === 'object') {
            return View.instance;
        }

        var viewIframe = document.createElement('iframe');
        document.body.appendChild(viewIframe);
        this.viewIframe = viewIframe;

        viewIframe.setAttribute('class', 'SMTD-view');
        viewIframe.setAttribute('frameBorder', '0');
        viewIframe.setAttribute('allowTransparency', 'true');
        viewIframe.setAttribute('scrolling', 'auto');
        viewIframe.setAttribute('height', '100%');
        viewIframe.setAttribute('width', '100%');

        this._setPostion();
        this.fetchCodeFromUrl(url);
        this.statu = VIEW_STATU_HIDE;

        View.instance = this;
    };

    View.prototype = {
        fetchCodeFromUrl: function (url) {
            this.viewIframe.setAttribute('src', VIEW_IFRAME_URL + '?url=' + encodeURIComponent(url));
        },
        _setPostion: function() {

        },
        show: function() {
            var self = this;
            window.setTimeout(function(){
                document.body.className = document.body.className + " SMTD";
                self.viewIframe.style.top = 0;
            },0);
            self.statu = VIEW_STATU_SHOW;
        },
        hide: function() {
            var self = this;
            window.setTimeout(function(){
            document.body.className = document.body.className.replace(" SMTD"," ");
                self.viewIframe.style.top = '100%';
            },0);
            self.statu = VIEW_STATU_HIDE;
        },
        minimize: function() {
            self.statu = VIEW_STATU_MIN;
        },
        toggle: function() {
            if (this.statu == VIEW_STATU_HIDE) {
                this.show();
            }
            else {
                this.hide();
            }
        }
    };

}