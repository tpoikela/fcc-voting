
'use strict';

(function () {

    var pollList = document.querySelector("#list-of-polls");
    var apiUrl = appUrl + '/polls';
    var style = "class='list-group-item'";

    var formatLinkHTML = function(url, id, name) {
        var atag = '<a href="' + url + '/' + id + '" ' + style + '>';
        var html = atag + '<p id="' + id + '">' + name + '</p>' + '</a>';
        return html;
    };

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

})();
