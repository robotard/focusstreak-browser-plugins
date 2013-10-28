var timer = new Date().getTime() / 1000;;

function check_focus(url) {
    if (url && url.indexOf("reddit.com") != -1) {
        time_survived = (new Date().getTime() / 1000) - timer;
        alert("You Focused for this many seconds: " + Math.floor(time_survived));
        timer = new Date().getTime() / 1000;
    }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "loading") {
      check_focus(tab.url);
    }
});
