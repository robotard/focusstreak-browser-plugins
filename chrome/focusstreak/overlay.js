function create_overlay() {
  overlay = document.createElement("div");
  overlay.className = "focusstreak_overlay";

  frame = document.createElement("div");
  frame.className = "focusstreak_overlay_frame";

  document.body.appendChild(overlay);
  document.body.appendChild(frame);

  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      frame.innerHTML = xhr.response;
      connect_buttons();
    }
  }

  xhr.open("GET", chrome.extension.getURL("focusstreak/overlay.html"), true);
  xhr.send();
}

function connect_buttons() {
  document.getElementById("focusstreak_escape_button").onclick = function() { console.log("Clicked escape!");};
  
  document.getElementById("focusstreak_break_button").onclick = function() { console.log("CALLBACK"); reply_callback("YIHAW YEAH RIGHT");};
}
if (document.getElementsByClassName("focusstreak_overlay").length == 0) {
  create_overlay();
  chrome.runtime.onMessage.addListener(onMessage);
}

var reply_callback = null;

function onMessage(message, sender, callback) {
  reply_callback = callback
}
