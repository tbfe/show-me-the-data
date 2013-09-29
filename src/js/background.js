var KEY_URL = 'http://liye04.fe.baidu.com/key.php',
    PARAM_KEY = '__qa';
var url, intervalId;

function checkForValidUrl(tabId, changeInfo, tab) {
    if (tab.url.indexOf('baidu.com') > -1) {
        chrome.pageAction.show(tabId);
    }
};

function showDataPage(tab) {
    url = new Uri(tab.url);
    if (!url.getQueryParamValue(PARAM_KEY)) {
        var value = getKeyFromCache();
        if (value) {
            showDataWithParam(value);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function handleStateChange(xhrpe) {
                stopLoadingAnimate(tab.id);
                if (xhrpe.srcElement.readyState !== 4) {
                    return;
                }
                if (url) {
                    showDataWithParam(xhrpe.srcElement.response);
                    localStorage.setItem(PARAM_KEY, xhrpe.srcElement.response);
                    localStorage.setItem('time', Date.now());
                }
            };
            xhr.open("GET", KEY_URL, true);
            xhr.send();
            startLoadingAnimate(tab.id);
        }
    } else {
        showDataWithParam('');
    }
}



function showDataWithParam(value) {
    url.replaceQueryParam(PARAM_KEY, value);
    chrome.tabs.insertCSS(null, {file: "css/view_iframe.css"});
    chrome.tabs.executeScript(null, {file: "js/view_iframe_init.js"}, function(){
        chrome.tabs.executeScript(null, {code: "var view = new View('"+ url.toString() +"');view.toggle();"});
    });
}

function getKeyFromCache(){
    try {
        var value = localStorage.getItem(PARAM_KEY);
        if (value == "") {
            return false;
        } else {
            var time = localStorage.getItem('time');
            if ((new Date(Number(time))).toDateString() === (new Date()).toDateString()) {
                return value;
            }
            else {
                return false;
            }
        }
    } catch (e) {
        return false;
    }
    return false;
}

var LOADING_FRAMEKEY = [0, 1, 2, 3];
function startLoadingAnimate(tabId) {
    var i = 0;
    intervalId = setInterval(function() {
        chrome.pageAction.setIcon({
            tabId: tabId,
            path: 'image/icon_frame' + LOADING_FRAMEKEY[i++ % 4] + '.png'
        });
    }, 400);
}
function stopLoadingAnimate(tabId){
    intervalId && clearInterval(intervalId);
    chrome.pageAction.setIcon({
            tabId: tabId,
            path: 'image/icon_frame_0.png'
    });
}
chrome.tabs.onUpdated.addListener(checkForValidUrl);
chrome.pageAction.onClicked.addListener(showDataPage);