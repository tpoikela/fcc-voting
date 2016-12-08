
// Used for MongoDB access
var User = require('../models/users.js');

module.exports = function() {

    // Adds one user to the database. Fails if a user exists already.
    this.addUser = function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (username && password) {
            User.findOne({"local.username": username}, function(err, user) {
                if (err) throw err;

                // If user doesn't exist, create new one and store into DB
                if (!user) {
					var newUser = new User();
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

    /** Returns info about the requested user (if authenticated).*/
    this.getUser = function(req, res) {
        if (req.isAuthenticated()) {
            console.log("Req auth, user " + JSON.stringify(req.user));
            if (req.user.github.username) {
                res.json({username: req.user.github.username});
            }
            else if (req.user.local.username) {
                console.log("Sending data now");
                res.json({username: req.user.local.username});
            }
            else
                res.sendStatus(400); // Something went wrong terribly
        }
        else {
            res.json({name: "guest"});
        }

    };

};

