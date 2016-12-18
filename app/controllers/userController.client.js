'use strict';

(function () {

   var $DEBUG = 0;

   var pollUrl = appUrl + '/polls';

   var profileId = document.querySelector('#profile-id') || null;
   var profileUsername = document.querySelector('#profile-username') || null;
   var profileRepos = document.querySelector('#profile-repos') || null;
   var welcomeMsg = document.querySelector('#welcome-msg');
   var apiUrl = appUrl + '/api/:id';

   var profilePollList = document.querySelector('#profile-poll-list') || null;
   var style = "class='list-group-item'";

   /** Updates HTML element with given data and property.*/
   function updateHtmlElement (data, element, userProperty) {
       if (data.hasOwnProperty(userProperty)) {
           element.innerHTML = data[userProperty];
       }
       else {
           console.log("Property " + userProperty + " not in data.");
       }
   }

   /** Sets the welcome msg based on login information.*/
   function setWelcomeMsg(userObject) {
      if (userObject.displayName) {
          welcomeMsg.innerHTML = "Welcome " + userObject.displayName + "!";
      }
      else if (userObject.username) {
          welcomeMsg.innerHTML = "Welcome " + userObject.username + "!";
      }
      else {
          welcomeMsg.innerHTML = "Welcome guest!";
      }
   }

   /** Creates a list of poll items.*/
   function createProfilePollList(polls) {
       var i = 0;
       for (i = 0; i < polls.length; i++) {
           var pollName = polls[i].name;
           var pollID = polls[i]._id;
           var pollLink = '<a href="' + pollUrl + '/' + pollID + '" ' + style + '>' + pollName +
               '</a>';

           var pollItem = document.createElement('li');
           pollItem.innerHTML = pollLink;

           profilePollList.appendChild(pollItem);
       }
   };

   /** Requests user data via ajax-get. */
   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (err, data) {
      if (err) throw new Error(err);
	  if (!data) return;

      if ($DEBUG) console.log("Data is " + data);
      var userObject = JSON.parse(data);

      if (welcomeMsg !== null) setWelcomeMsg(userObject);

      if (profileUsername !== null) {
         updateHtmlElement(userObject, profileUsername, 'username');
      }

      if (profilePollList !== null) {
          createProfilePollList(userObject.polls);
      }

   }));
})();
