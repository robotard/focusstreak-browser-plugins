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

var args = window.location.hash;

var access_token = getAccessTokenFromArgs(args);

if (access_token) {
  localStorage.access_token = access_token;
} else {
  localStorage.access_token_error = getErrorFromArgs(args);
}

window.location = chrome.extension.getURL('options/options.html');
