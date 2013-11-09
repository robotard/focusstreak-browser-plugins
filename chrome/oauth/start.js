var url = "http://127.0.0.1:9292/oauth/authorize?client_id=52757eecdea8697ee2000001&redirect_uri=http://127.0.0.1:9292/robots.txt&response_type=token";
chrome.tabs.create({url: url})
