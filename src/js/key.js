var KEY_URL = 'http://liye04.fe.baidu.com/key.php',
    PARAM_KEY = '__qa';
    LANGUAGE_KEY = '__type';

function _getKeyFromCache() {
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

function _cacheKeyFromServer(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function handleStateChange(xhrpe) {
        if (xhrpe.srcElement.readyState !== 4) {
            return;
        }
        var response = xhrpe.srcElement.response;
        localStorage.setItem(PARAM_KEY, response);
        localStorage.setItem('time', Date.now());
        callback && callback(response);
    };
    xhr.open("GET", KEY_URL, true);
    xhr.send();
}

function getKey(callback) {
    var key = _getKeyFromCache();
    if (key) {
        callback(key);
    }
    else {
        _cacheKeyFromServer(callback); 
    }
}

function getLanguage() {
    try {
        language = localStorage.getItem('language');
    }
    catch (e) {}
    return language || 'php';
}
function setLanguage(language) {
    try {
        localStorage.setItem('language', language);
    }
    catch (e) {}
}