function create_overlay() {
  overlay = document.createElement("div");
  overlay.id = "focusstreak_overlay";

  content = document.createElement("div");
  content.id = "focusstreak_overlay_content";

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      content.innerHTML = xhr.response;
      connect_buttons();
    }
  };

  xhr.open("GET", chrome.extension.getURL("focusstreak/overlay.html"), true);
  xhr.send();
}

function connect_buttons() {
  document.getElementById("focusstreak_escape_button").onclick = escape_clicked;
  document.getElementById("focusstreak_break_button").onclick = break_clicked;
}

function escape_clicked() {
  window.history.back();
}

function break_clicked() {
  overlay = document.getElementById("focusstreak_overlay")
  overlay.parentNode.removeChild(overlay);
  chrome.runtime.sendMessage(document.location.href);
}

if (document.getElementById("focusstreak_overlay_content") == undefined) {
  create_overlay();
}
