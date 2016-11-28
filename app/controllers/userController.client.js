'use strict';

(function () {

   var profileId = document.querySelector('#profile-id') || null;
   var profileUsername = document.querySelector('#profile-username') || null;
   var profileRepos = document.querySelector('#profile-repos') || null;
   var welcomeMsg = document.querySelector('#welcome-msg');
   var apiUrl = appUrl + '/api/:id';

   /** Updates HTML element with given data and property.*/
   function updateHtmlElement (data, element, userProperty) {
       if (data.hasOwnProperty(userPropert)) {
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

   /** Requests user data via ajax-get. */
   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
	  if (!data) return;

      console.log("Data is " + data);
      var userObject = JSON.parse(data);
      setWelcomeMsg(userObject);

      if (profileId !== null) {
         updateHtmlElement(userObject, profileId, 'id');
      }

      if (profileUsername !== null) {
         updateHtmlElement(userObject, profileUsername, 'username');
      }

      if (profileRepos !== null) {
         updateHtmlElement(userObject, profileRepos, 'publicRepos');
      }

   }));
})();
