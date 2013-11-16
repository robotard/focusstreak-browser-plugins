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
    console.log("Idle Changed!");
    stop_and_increment_timer();
  } else {
    start_stopwatch();
  }
}

function focus_changed(windowId) {
  if (windowId == chrome.windows.WINDOW_ID_NONE) {
    console.log("Focus Changed LOSS!");
    stop_and_increment_timer();
  } else {
    console.log("Focus Changed GAIN!");
    start_stopwatch();
    chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
      check_focus(tab[0]);
    });
  }
}

function check_focus(tab) {
  if (tab.url && tab.url.indexOf("reddit.com") != -1) {
    chrome.tabs.insertCSS(tab.id, {file:"focusstreak/overlay.css"});
    chrome.tabs.executeScript(tab.id, {file:"focusstreak/overlay.js"}, function() {       chrome.tabs.sendMessage(tab.id, "", function(response) { console.log("Message response callback in the extension:" + response);})});
    stop_and_increment_timer();
    console.log("You Focused for this many seconds: " + Math.floor(timer));
    OAuth.logStreak(Math.floor(timer));
    timer = 0;
    start_stopwatch();
  }
}

function start() {
  start_stopwatch();
  chrome.idle.setDetectionInterval(25);
  chrome.idle.onStateChanged.addListener(idle_state_changed)
  chrome.windows.onFocusChanged.addListener(focus_changed)

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "loading") {
      console.log("onUpdated!");
      check_focus(tab);
    }
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      console.log("onActive!");
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
