
// Used for MongoDB access
var User = require('../models/users.js');

module.exports = function() {

    // Adds one user to the database. Fails if a user exists already. This is
    // used only for local registration. github users are added in passport.js
    this.addLocalUser = function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (username && password) {
            User.findOne({"username": username}, function(err, user) {
                if (err) throw err;

                // If user doesn't exist, create new one and store into DB
                if (!user) {
					var newUser = new User();
                    newUser.username = username;
                    newUser.local.username = username;
                    newUser.local.password = password;

                    newUser.save(function(err) {
                        if (err) throw err;
                        console.log("Register local user " + username + " with pw " + password);
                        res.json({msg: "Username " + username + " registered successfully."});
                    });

                }
                else {
                    res.json({error: "Username already taken."});
                }
            });
        }
        else {
            //TODO provide more info for the client
            res.sendStatus(400);
        }
    };

    var sendAuthenticatedUserInfo = function(res, username) {
        User.findOne({"username": username})
            .populate("polls")
            .exec(function(err, user) {
                if (err) throw err;

                if (user) {
                    res.json(user);
                }
                else {
                    res.json({error: "No user " + username + " found in database."});
                }
        });
    };

    /** Returns info about the requested user (if authenticated).*/
    this.getUser = function(req, res) {
        if (req.isAuthenticated()) {
            console.log("getUser Req auth, user " + JSON.stringify(req.user));
            var username = req.user.username;

            /*
            if (req.user.github.username) {
                username = req.user.github.username;
            }
            else if (req.user.local.username) {
                username = req.user.local.username;
            }
            else {
                res.sendStatus(400); // Something went wrong terribly
            }*/

            //TODO send a full user object
            //res.json({username: username});
            sendAuthenticatedUserInfo(res, username);
        }
        else {
            res.json({name: "guest"});
        }

    };

};

