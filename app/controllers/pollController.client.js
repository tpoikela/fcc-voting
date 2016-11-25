
'use strict';

(function () {

    var pollList = document.querySelector("#list-of-polls");
    var apiUrl = appUrl + '/polls';

    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
        var polls = JSON.parse(data);

        if (polls.length > 0) {
            var html = "";
            for (var i = 0; i < polls.length; i++) {
                html += '<p>' + polls[i] + '</p>';
            }
            pollList.innerHTML = html;
        }
    }));

})();
