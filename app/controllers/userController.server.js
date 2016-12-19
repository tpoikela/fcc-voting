
// Used for MongoDB access
var User = require('../models/users.js');

const hash = require("../common/hash_password");

module.exports = function(path) {

    var errorHandler = function(err, res) {
        console.error("userController Server error: " + err);
        res.sendStatus(500);
    };

    // Adds one user to the database. Fails if a user exists already. This is
    // used only for local registration. github users are added in passport.js
    this.addLocalUser = function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (username && password) {
            User.findOne({"username": username}, function(err, user) {
                if (err) return errorHandler(err, res);

                // If user doesn't exist, create new one and store into DB
                if (!user) {
					var newUser = new User();
                    newUser.username = username;
                    newUser.local.username = username;

                    newUser.local.password = hash.getHash(password);

                    newUser.save(function(err) {
                        if (err) return errorHandler(err, res);
                        console.log("Register local user " + username + " with pw " + password);
                        res.render(path + "/pug/signup_done.pug",
                            {ok: true, name: username});
                    });

                }
                else {
                    res.render(path + "/pug/signup_done.pug",
                        {ok: false, name: username});
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
                if (err) return errorHandler(err, res);

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
            sendAuthenticatedUserInfo(res, username);
        }
        else {
            res.json({name: "guest"});
        }

    };

};

