var _timestamp;//上一次点击的时间

function checkForValidUrl(tabId, changeInfo, tab) {
    if (tab.url.indexOf('baidu.com') > -1) {
        chrome.pageAction.show(tabId);
    }
};


function showDataPage(tab) {
    var callback = function(key) {
        showDataPageIframe(tab);
    };
    if (_timestamp > Date.now() - 500) {
        callback = function(key) {
            showDataPageInNewTab(key, tab);
        };
    }
    getKey(callback);
    _timestamp = Date.now();
}

function showDataPageInNewTab(key, tab) {
    var url = new Uri(tab.url);
    url.replaceQueryParam(PARAM_KEY, key);
    window.open(url.toString());
}
function showDataPageIframe(tab) {
    chrome.tabs.insertCSS(null, {file: "css/view_iframe.css"});
    chrome.tabs.executeScript(null, {file: "js/view_iframe_init.js"}, function(){
        chrome.tabs.executeScript(null, {code: "var view = new View('"+ tab.url +"');view.toggle();"});
    });
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
chrome.pageAction.onClicked.addListener(showDataPage);