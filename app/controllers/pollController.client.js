
'use strict';

(function () {

    var pollList = document.querySelector("#list-of-polls");
    var apiUrl = appUrl + '/polls';

    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
        var polls = JSON.parse(data);

        if (polls.length > 0) {
            var html = "";
            for (var i = 0; i < polls.length; i++) {
                var id  = polls[i]._id;
                html += '<p id="' + id '">' + polls[i].name + '</p>';
            }
            pollList.innerHTML = html;
        }
    }));

})();
