function getErrorFromArgs(args) {
  try {
    return /error=(.*)&/.exec(args)[1];
  } catch (error) {
    return "Unknown error";
  }
}

function getAccessTokenFromArgs(args) {
  try {
    return /access_token=(\w*)&/.exec(args)[1];
  } catch (error) {
    return false;
  }
}


error = /access_token=(.*)&/.exec(args)

var args = window.location.hash;

access_token = getAccessTokenFromArgs(args);

if (!access_token) {
  alert(getErrorFromArgs(args));
}

console.log("Access Token:" + access_token);

var xhr = new XMLHttpRequest();

xhr.onreadystatechange=function() {
  if (xhr.readyState == 4 && xhr.status != 200) {
    console.log(xhr.responseText);
  }
}

xhr.open('POST', "http://127.0.0.1:9292/api/streaks", true);

xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xhr.setRequestHeader('Authorization', 'OAuth ' + access_token);

name = "test name";
info = "test info";

xhr.send("name=test name&info=test info&duration=1986&timestamp=" + Date());

/*
chrome.tabs.getCurrent(function(tab) {
  chrome.tabs.remove(tab.id, function() { });
});
*/
