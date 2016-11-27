
/** Contains code which handles creation of new polls on the client-side.*/

'use strict';

(function () {

    var optionList = document.querySelector("#options-list");
    var createButton = document.querySelector("#create-button");
    var addButton = document.querySelector("#add-option-button");
    var pollNameInput = document.querySelector("#poll-name-input");
    var optionNameInput = document.querySelector("#option-name-input");
    var apiUrl = appUrl + '/polls/create';
    //
    //

    // Returns the option parameters for a poll
    var getOptParams = function() {
        var options = document.getElementsByClassName("poll-option");
        //var res = "options=";
        var res = "";
        for (var i = 0; i < options.length; i++) {
            res += "options=" + options[i].innerHTML;
            if (i < options.length-1) res += "&";
        }
        return res;
    };

    createButton.addEventListener("click", function() {
        var params = "";
        var optParams = getOptParams();
        var pollName = pollNameInput.value;
        params += "name=" + pollName + "&" + optParams;
        console.log("Params are: " + params);
        ajaxFunctions.ajaxRequest('POST', apiUrl, function (data) {}, params);
    });

    addButton.addEventListener("click", function() {
        console.log("Poll name is " + pollNameInput.value);
        var optElem = document.createElement("li");
        optElem.setAttribute("class", "poll-option");
        optElem.innerHTML = optionNameInput.value;
        optionList.appendChild(optElem);
        optionNameInput.value = "";
    });

})();
