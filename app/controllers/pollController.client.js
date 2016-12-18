
'use strict';

(function () {

    var getPollIdOrName = function(url) {
        console.log("URL is " + url + " type " + typeof url);
         var arr = url.split('/');
         var last = arr[arr.length - 1];
         if (/[a-zA-Z0-9]/.test(last)) {
             return last;
         }
         return last;
    };

    var $DEBUG = 0;

    var appUrl = window.location.origin;
    var thisUrl = window.location;
    //var pollID = /[a-zA-Z0-9]+$/.exec(thisUrl);
    var pollID = getPollIdOrName(thisUrl.toString());

    if ($DEBUG) console.log("URL: |" + thisUrl + "| Poll ID is |" + pollID + "|");

    var pollList = document.querySelector("#list-of-polls") || null;
    var apiUrl = appUrl + '/polls';
    var style = "class='list-group-item'";

    var pollChart = document.querySelector("#poll-chart") || null;

    var getPollAPI = appUrl + '/polls/getpolls/' + pollID;

    /** Returns the a elem to the specified poll. */
    var getPollAElem = function(url, id, name) {
        var atag = document.createElement("a");
        atag.setAttribute("href", url + "/" + id);
        atag.setAttribute("class", "list-group-item");

        var ptag = document.createElement("p");
        ptag.setAttribute("class", "poll-list-item");
        ptag.setAttribute("id", id);
        ptag.textContent = name;

        atag.appendChild(ptag);
        return atag;
    };

    if (pollList !== null)
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (err, data) {
        if (err) throw new Error(err);
        else {
            var polls = JSON.parse(data);
            var i = 0;

            if (polls.length > 0) {
                for (i = 0; i < polls.length; i++) {
                    var id  = polls[i]._id;
                    var elem = getPollAElem(apiUrl, id, polls[i].name);
                    pollList.appendChild(elem);
                }
            }
            else {
                pollList.innerHTML = "<p " + style + " >" +
                    "There are no polls yet. Signup, login and create one.</p>";
            }
        }
    }));

    // Called only on the actual poll page. Retrieves votes and poll choices,
    // and generates a chart for the poll showing results.
    if (pollChart !== null)
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', getPollAPI, function (err, data) {
        if (err) throw new Error(err);
        else {
            var poll = JSON.parse(data);
            if ($DEBUG) console.log("Poll data is " + data);
            var choices = poll.options.names;
            var votes = poll.options.votes;
            genPollChart("#poll-chart", choices, votes);
        }

    }));

})();
