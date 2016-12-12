
'use strict';

(function () {

    var appUrl = window.location.origin;
    var thisUrl = window.location;
    var pollID = /[a-zA-Z0-9]+$/.exec(thisUrl);

    console.log("URL: " + thisUrl + " Poll ID is " + pollID);

    var pollList = document.querySelector("#list-of-polls") || null;
    var apiUrl = appUrl + '/polls';
    var style = "class='list-group-item'";

    var pollChart = document.querySelector("#poll-chart") || null;
    var getPollAPI = appUrl + '/polls/getpolls/' + pollID;

    var formatLinkHTML = function(url, id, name) {
        var atag = '<a href="' + url + '/' + id + '" ' + style + '>';
        var html = atag + '<p id="' + id + '">' + name + '</p>' + '</a>';
        return html;
    };

    if (pollList !== null)
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (err, data) {
        if (err) throw new Error(err);
        else {
            var polls = JSON.parse(data);

            if (polls.length > 0) {
                var html = "";
                for (var i = 0; i < polls.length; i++) {
                    var id  = polls[i]._id;
                    html += formatLinkHTML(apiUrl, id, polls[i].name);
                }
                pollList.innerHTML = html;
            }
        }
    }));

    if (pollChart !== null)
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', getPollAPI, function (err, data) {
        if (err) throw new Error(err);
        else {
            var poll = JSON.parse(data);
            console.log("Poll data is " + data);
            var choices = poll.options.names;
            var votes = poll.options.votes;
            genPollChart("#poll-chart", choices, votes);
        }

    }));

})();
