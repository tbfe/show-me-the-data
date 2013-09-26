// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

var Uri = function (str) {
	this.url = str;
	this.data = parseUri(str);
}
Uri.prototype = {
	getQueryParamValue: function(param) {
		return this.data.queryKey[param];
	},
	replaceQueryParam: function(param, value) {
		this.data.queryKey[param] = value.toString();
	},
	toString: function(){
		var url = this.data.protocol + '://' + this.data.authority + this.data.path;
		if (this.data.queryKey) {
			url += '?';
			for (var key in this.data.queryKey) {
				url += key + '=' + this.data.queryKey[key] + '&';
			}
		}
		return url;
	}
}

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
			openUrlWithParam(value);
		} else {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function handleStateChange(xhrpe) {
				stopLoadingAnimate(tab.id);
				if (xhrpe.srcElement.readyState !== 4) {
					return;
				}
				if (url) {
					openUrlWithParam(xhrpe.srcElement.response);
					localStorage.setItem(PARAM_KEY, xhrpe.srcElement.response);
					localStorage.setItem('time', Date.now());
				}
			};
			xhr.open("GET", KEY_URL, true);
			xhr.send();
			startLoadingAnimate(tab.id);
		}
	} else {
		openUrlWithParam('');
	}
}



function openUrlWithParam(value) {

	url.replaceQueryParam(PARAM_KEY, value);
	window.open(url.toString());
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
			path: 'icon_' + LOADING_FRAMEKEY[i++ % 4] + '.png'
		});
	}, 400);
}
function stopLoadingAnimate(tabId){
	intervalId && clearInterval(intervalId);
	chrome.pageAction.setIcon({
			tabId: tabId,
			path: 'icon_0.png'
	});
}
chrome.tabs.onUpdated.addListener(checkForValidUrl);
chrome.pageAction.onClicked.addListener(showDataPage);