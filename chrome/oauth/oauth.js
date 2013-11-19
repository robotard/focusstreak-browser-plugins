var OAuth = {
  oauthDoneCallback: function() { },

  oauthCall: function(call, params) {
  },

  logStreak: function(hostname, duration) {
    console.log(hostname + " broke your Focuse Streak of this many seconds: " + duration);
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange=function() {
      if (xhr.readyState == 4 && xhr.status != 200) {
        //FIXME: Remove this alert & handle the error gracefully once out of alpha
        alert("Focus Streak API post failed. See browser console.");
        console.log(xhr.responseText);
      }
    }

    xhr.withCredentials = false;
    xhr.open('POST', "http://127.0.0.1:9292/api/streaks", true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.setRequestHeader('Authorization', 'OAuth ' + localStorage.access_token);

    xhr.send("name=Google Chrome&info=" + hostname + "&duration=" + duration + "&timestamp=" + Date());
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

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function() {
      if (xhr.readyState != 4) {
        return;
      }

      return callback(xhr.status == 200);
    };

    xhr.withCredentials = false;
    xhr.open('GET', "http://127.0.0.1:9292/api/streaks", true);
    xhr.setRequestHeader('Authorization', 'OAuth ' + localStorage.access_token);

    xhr.send();
  },

  login: function(oauthDoneCallback) {
    this.oauthDoneCallback = oauthDoneCallback;
    chrome.tabs.create({url: "http://127.0.0.1:9292/oauth/authorize?client_id=52757eecdea8697ee2000001&redirect_uri=http://127.0.0.1:9292/robots.txt&response_type=token"}, this.oauthTabCallback.bind(this));
  },
};
