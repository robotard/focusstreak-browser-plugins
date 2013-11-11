function start() {
  var timer = new Date().getTime() / 1000;;

  function check_focus(url) {
    if (url && url.indexOf("reddit.com") != -1) {
      time_survived = (new Date().getTime() / 1000) - timer;
      alert("You Focused for this many seconds: " + Math.floor(time_survived));
      OAuth.logStreak(Math.floor(time_survived));
      timer = new Date().getTime() / 1000;
    }
  }


  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if (changeInfo.status === "loading") {
        check_focus(tab.url);
      }
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
    console.log("LOGIN!");
    OAuth.login(loginCallback);
  }
}

OAuth.verifyLoggedIn(verifyLoggedInCallback);
