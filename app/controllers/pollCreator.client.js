
/** Contains code which handles creation of new polls on the client-side.*/

'use strict';

(function () {
    var $DEBUG = 0; // When 1, prints debug information

    var optionList      = document.querySelector("#options-list");
    var createButton    = document.querySelector("#create-button");
    var addButton       = document.querySelector("#add-option-button");
    var pollNameInput   = document.querySelector("#poll-name-input");
    var optionNameInput = document.querySelector("#option-name-input");
    var pollCreateMsg   = document.querySelector("#poll-create-message");

    var apiUrl = appUrl + '/polls/create';

    var addedOptions = [];

    // Returns the option parameters for a poll
    var getOptParams = function() {
        var options = document.getElementsByClassName("poll-option");
        var res = "";
        var i = 0;
        for (i = 0; i < options.length; i++) {
            res += "options=" + options[i].textContent;
            if (i < options.length-1) res += "&";
        }
        return res;
    };

    var clearUserEnteredData = function() {
        optionList.innerHTML = "";
        optionNameInput.value = "";
        pollNameInput.value = "";
    };

    /** Send a new poll to the server using POST.*/
    createButton.addEventListener("click", function() {
        var params    = "";
        var optParams = getOptParams();
        var pollName  = pollNameInput.value;

        params += "name=" + pollName + "&" + optParams;
        if ($DEBUG) console.log("Params are: " + params);

        // Callback called after POST finishes
        var postCb = function(err, data) {
            if (err) {
                var msg = "Error creating the poll. <, > and / are not allowed in names.";
                pollCreateMsg.setAttribute("class", "text-danger");
                pollCreateMsg.textContent = msg;
            }
            else {
                if (data) {
                    var json = JSON.parse(data);
                    clearUserEnteredData();
                    if ($DEBUG) console.log("URI is " + json.uri);
                    var html = '<p>' + json.msg + '<br/>' +
                        "You can share the poll using the link:<br/>" +
                        "<a href='" + json.uri + "'>"+ json.uri + "</a></p>";

                    pollCreateMsg.setAttribute("class", "text-info");
                    pollCreateMsg.innerHTML = html;
                }
            }
        };

        ajaxFunctions.ajaxRequest('POST', apiUrl, postCb, params);
    });

    // When clicked, adds a new option to the Poll
    addButton.addEventListener("click", function() {
        var optName = optionNameInput.value;
        if (addedOptions.indexOf(optName) === -1) {
            addedOptions.push(optName);
            var optElem = document.createElement("li");
            optElem.setAttribute("class", "list-group-item poll-option");
            optElem.textContent = optName;
            optionList.appendChild(optElem);
            optionNameInput.value = "";
        }
        else {
            var msg = "Use unique option names. Duplicate name: " + optName;
            pollCreateMsg.setAttribute("class", "text-danger");
            pollCreateMsg.textContent = msg;
        }
    });

})();
