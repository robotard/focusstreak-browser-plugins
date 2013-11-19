var timer = 0;
var stopwatch = false;

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

var url_parser = document.createElement('a');

function check_focus(tab) {
  url_parser.href = tab.url;
  var hostname = url_parser.hostname;
  //FIXME: Cache the blacklist!
  var blacklist = JSON.parse(localStorage.blacklist);

  if (hostname && blacklist.indexOf(hostname) > -1) {
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
