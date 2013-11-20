function load_options() {
  if (!has_blacklist()) {
    get_most_visited_sites(first_run);
  } else {
    populate_blacklist_table();
  }

  document.forms["hostname_form"].onsubmit = submit_new_blacklist_hostname;
}

function submit_new_blacklist_hostname() {
  var input = document.forms["hostname_form"]["hostname"];
  add_to_blacklist(input.value);
  input.value = "";

  // Reliably returns focus to the input box. (focus()/select() didn't cut it)
  return false;
}

function first_run(blacklist) {
  var heading = "";

  if (blacklist.length == 0) {
    heading = "You don't seem to have any browsing history to create a blacklist from, so we've made one up help you get started.";
    blacklist = ["reddit.com", "facebook.com", "news.ycombinator.net", "twitter.com"];
  } else {
    heading = "According to your history, these are the top " + blacklist.length + " sites you visit."
  }

  set_blacklist(blacklist);
  var welcome_element = document.getElementById("welcome_heading");
  welcome_element.innerText = heading;
  populate_blacklist_table();
}

function populate_blacklist_table() {
  var blacklist = get_blacklist();
  table = document.getElementById("blacklist_table");
  for (var i=0; i < blacklist.length; i++) {
    var row = table.insertRow(-1);
    var icon_cell = row.insertCell(0);
    var link_cell = row.insertCell(1);
    var remove_cell = row.insertCell(2);
    //FIXME: Some sites are missing favicons since they're actually https://
    icon_cell.innerHTML = "<img src='chrome://favicon/http://" + blacklist[i] + "'></img>";
    link_cell.innerText = blacklist[i];
    remove_cell.innerHTML = "<a href='#' id='" + blacklist[i] + "'>-</a>"
    remove_cell.hostname = blacklist[i];
    remove_cell.onclick = function() { remove_from_blacklist(this.hostname); };
  }
  document.getElementById("loading").innerText = '';
}

function add_to_blacklist(hostname) {
  blacklist = get_blacklist();
  blacklist.push(hostname);
  set_blacklist(blacklist);
}

function get_blacklist() {
  return JSON.parse(localStorage.blacklist);
}

function set_blacklist(blacklist) {
  localStorage.blacklist = JSON.stringify(blacklist);
  clear_blacklist_table();
  populate_blacklist_table();
}

function remove_from_blacklist(hostname) {
  var blacklist = get_blacklist();
  var index = blacklist.indexOf(hostname);
  blacklist.splice(index, 1);
  set_blacklist(blacklist);
}

function clear_blacklist_table() {
  var table = document.getElementById('blacklist_table');
  while ( table.rows.length > 0 ) {
    table.deleteRow(0);
  }
}

function has_blacklist() {
  return (localStorage.blacklist != undefined)
}

function get_most_visited_sites(callback) {
  six_months_ago = (new Date().getTime()) - (1000 * 60 * 60 * 24 * 30 * 6);

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

    tuples = tuples.slice(Math.max(tuples.length - Math.min(10, tuples.length)));

    var blacklist = [];
    // Just keep the hostnames - we can discard the counts now.
    for (var i=0; i < tuples.length; i++) {
      blacklist.push(tuples[i][0]);
    }

    callback(blacklist);
  });
}


document.addEventListener('DOMContentLoaded', load_options);
