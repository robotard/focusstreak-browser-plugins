var timer = 0;
var stopwatch = false;

function get_most_visited_sites(callback) {
  six_months_ago = (new Date().getTime()) - (60 * 60 * 24 * 30 * 6);

  chrome.history.search({text:'', startTime: six_months_ago, maxResults: 90000}, function(items) {
    history_dict = new Object();
    var parser = document.createElement('a');
    var count = 0;
    for (var i=0; i < items.length; i++) {
      parser.href = items[i].url
      count = items[i].typedCount + items[i].visitCount;
      if (!history_dict.hasOwnProperty(parser.hostname)) {
        history_dict[parser.hostname] = count;
      } else {
        history_dict[parser.hostname] += count;
      }
    }

    var tuples = [];

    for (var key in history_dict) tuples.push([key, history_dict[key]]);

    tuples.sort(function(a, b) {
      a = a[1];
      b = b[1];
      return a < b ? -1 : (a > b ? 1 : 0);
    });

    callback(tuples.slice(Math.max(tuples.length - Math.min(10, tuples.length))));
  });
}

function stop_stopwatch() {
  stopwatch = false;
}

function stop_and_increment_timer() {
  if (!stopwatch) {
    return;
  }
  timer += ((new Date().getTime()) - stopwatch)/1000;
  stop_stopwatch();
}

function start_stopwatch() {
  stopwatch = new Date().getTime();
}

function idle_state_changed(new_state) {
  if (new_state != "active") {
    stop_and_increment_timer();
  } else {
    start_stopwatch();
  }
}

function focus_changed(windowId) {
  if (windowId == chrome.windows.WINDOW_ID_NONE) {
    stop_and_increment_timer();
  } else {
    start_stopwatch();
    chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
      check_focus(tab[0]);
    });
  }
}

function check_focus(tab) {
  if (tab.url && tab.url.indexOf("reddit.com") != -1) {
    chrome.tabs.insertCSS(tab.id, {file:"focusstreak/overlay.css"});
    chrome.tabs.executeScript(tab.id, {file:"focusstreak/overlay.js"});
    stop_and_increment_timer();
  } else {
    if (!stopwatch) {
      start_stopwatch();
    }
  }
}

function log_streak() {
  OAuth.logStreak(Math.floor(timer));
  timer = 0;
  start_stopwatch();
}

function start() {
  start_stopwatch();
  chrome.idle.setDetectionInterval(25);
  chrome.idle.onStateChanged.addListener(idle_state_changed)
  chrome.windows.onFocusChanged.addListener(focus_changed)
  chrome.runtime.onMessage.addListener(log_streak);

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "loading") {
      check_focus(tab);
    }
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      check_focus(tab);
   });
  });

}

function loginCallback(success) {
  if (success) {
    start();
  } else {
    //FIXME: Better error handling
    alert("Failed to log into oauth. Contact support");
  }
}

function verifyLoggedInCallback(loggedIn) {
  if (loggedIn) {
    start();
  } else {
    OAuth.login(loginCallback);
  }
}

OAuth.verifyLoggedIn(verifyLoggedInCallback);
