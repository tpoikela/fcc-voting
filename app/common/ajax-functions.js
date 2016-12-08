'use strict';

var appUrl = window.location.origin;

var ajaxFunctions = {

    ready: function ready (fn) {
        if (typeof fn !== 'function') return;
        if (document.readyState === 'complete') return fn();

        document.addEventListener('DOMContentLoaded', fn, false);
    },

    /** Performs an Ajax request based on method args.*/
    ajaxRequest: function ajaxRequest (method, url, callback, params) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
               callback(null, xmlhttp.response);
            }
            else if (xmlhttp.readyState === 4) {
               callback(xmlhttp.status);
            }
        };

        xmlhttp.open(method, url, true);

        if (params) {
            xmlhttp.setRequestHeader("Content-type", 
                "application/x-www-form-urlencoded");
            xmlhttp.send(params);
        }
        else xmlhttp.send();
    }
};

