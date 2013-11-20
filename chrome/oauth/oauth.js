var OAuth = {
  oauthDoneCallback: function() { },

  logStreak: function(hostname, duration) {
    console.log(hostname + " broke your Focuse Streak of this many seconds: " + duration);
    this.oauthCall("POST", "streaks","name=Google Chrome&info=" + hostname + "&duration=" + duration + "&timestamp=" + Date());
  },

  oauthCall: function(mode, call, params, callback) {
    callback = typeof callback !== "undefined" ? callback : function() {};
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange=function() {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status == 200) {
        callback(true);
      } else {
        //FIXME: Remove this & handle the error gracefully once out of alpha
        console.log(xhr.responseText);
        callback(false);
      }
    }

    xhr.withCredentials = false;
    xhr.open(mode, "http://127.0.0.1:9292/api/" + call, true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.setRequestHeader('Authorization', 'OAuth ' + localStorage.access_token);

    xhr.send(params);
  },

  oauthTabCallback: function(tab) {
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
      if (tab.id == tabId) {
        chrome.tabs.onRemoved.removeListener(arguments.callee);
        this.oauthDoneCallback(localStorage.access_token != undefined);
      }
    }.bind(this));
  },

  verifyLoggedIn: function(callback) {
    if (localStorage.access_token == undefined) {
      return callback(false);
    }

    this.oauthCall("GET", "email", "", callback);
  },

  login: function(oauthDoneCallback) {
    this.oauthDoneCallback = oauthDoneCallback;
    chrome.tabs.create({url: "http://127.0.0.1:9292/oauth/authorize?client_id=52757eecdea8697ee2000001&redirect_uri=http://127.0.0.1:9292/robots.txt&response_type=token"}, this.oauthTabCallback.bind(this));
  },
};
