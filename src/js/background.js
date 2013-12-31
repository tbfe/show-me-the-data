var _timestamp; //上一次点击的时间

function checkForValidUrl(tabId, changeInfo, tab) {
    if (tab.url.indexOf('baidu.com') > -1) {
        chrome.pageAction.show(tabId);
    }
}


function showDataPage(tab) {
    var callback = function(key) {
        showDataPageIframe(tab);
    };
    if (_timestamp > Date.now() - 500) {
        callback = function(key) {
            chrome.tabs.executeScript(null, {
                code: "(new View()).hide()"
            });
            showDataPageInNewTab(key, tab);
        };
    }
    Cache.getKey(callback);
    _timestamp = Date.now();
}

function showDataPageInNewTab(key, mix) {
    var url;
    if (mix === undefined) return;
    if (typeof mix === 'string') {
        url = mix;
    } else {
        //传入的是tab
        url = mix.url;
    }
    url = new Uri(url);
    url.replaceQueryParam(PARAM_KEY, key);
    window.open(url.toString());
}

function showDataPageIframe(tab) {
    chrome.tabs.insertCSS(null, {
        file: "css/view_iframe.css"
    });
    chrome.tabs.executeScript(null, {
        file: "js/view_iframe_init.js"
    }, function() {
        chrome.tabs.executeScript(null, {
            code: "var view = new View('" + tab.url + "');view.toggle();"
        });
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.code) {
        case 'close':
            chrome.tabs.executeScript(null, {
                code: "(new View()).hide()"
            });
            break;
        case 'newtab':
            Cache.getKey(function(key) {
                showDataPageInNewTab(key, request.data.url);
            });
            break;
        default:
            console.log('unrecognized message recieved: ', request);
    }
});

chrome.tabs.onUpdated.addListener(checkForValidUrl);
chrome.pageAction.onClicked.addListener(showDataPage);