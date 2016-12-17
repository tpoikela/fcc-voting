
const url = require('url');

const Poll = require("../models/polls.js");
const User = require("../models/users.js");

module.exports = function(path, app_url) {

    if (!path) throw new Error("app path not given!");
    if (!app_url) throw new Error("app_url not given!");

    var $DEBUG = 0;

    var getPollURI = function(name) {
        var pollURI = encodeURIComponent(name);
        return app_url + "/p/" + pollURI;
    };

    var handleError = function(err, req, res) {
        console.error("SERVER ERROR: Headers :" + JSON.stringify(req.headers));
        console.error("\t From IP: " + req.ip);
        //console.error("\t From IP: " + req.ip);
        console.error(err);
        return res.sendStatus(500);
    };

    /** Returns true is request came from poll's creator.*/
    var isPollCreator = function(req, poll) {
        if (req.hasOwnProperty("user")) {
            return req.user.username === poll.info.creator;
        }
        else {
            return false;
        }
    };

    /** Updates a poll entry in the database.*/
    var updatePollDb = function(pollID, poll, cb) {
        var setOp = {$set: {
            "options.votes": poll.options.votes,
            "options.names": poll.options.names,
            "info.voters": poll.info.voters
        }};
        var opts = {};

        Poll.update({_id: pollID}, setOp, opts, function(err) {
            if (err) cb(err);
            else cb(null);
        });

    };

    /** Removes a poll from a user.*/
    var removePollFromUser = function(poll, user, cb) {
        User.findOne({_id: user._id}, function(err, userResult) {
            if (err) return cb(err);

            var index = userResult.polls.indexOf(poll._id);
            if (index >= 0) {
                userResult.polls.slice(index);

                var setOpt = {$set: {
                    polls: userResult.polls,
                }};

                User.update({_id: userResult._id}, setOpt, {}, function(err) {
                    if (err) return cb(err);
                    cb(null); // No error, everything OK
                });
            }

        });
    };

    /** Finds all polls from the database and returns their names and IDs.*/
    this.getPolls = function(req, res) {
        Poll.find({}, {name: 1, _id: 1}, function(err, result) {
            if (err) return handleError(err, req, res);
            if ($DEBUG) console.log("getPolls: " + JSON.stringify(result));
            res.json(result);
        });
    };

    /** Returns poll information as JSON.*/
    this.getPollAsJSON = function(req, res) {
        if (req.params.id) {
            var pollID = req.params.id;
            Poll.findOne({_id: pollID}, function(err, result) {
                if (err) return handleError(err, req, res);
                res.json(result);
            });
        }
        else {
            res.sendStatus(400);
        }
    };

	/** Adds one poll into the database. */
	this.addPoll = function(req, res) {
        var user = req.user;
        var poll = new Poll();
        poll.info.creator = user.username;

        // Extract name and options from post-request
        poll.name = req.body.name;
        var opts = req.body.options;
        poll.options.names = opts;

        var votes = [];
        for (var i = 0; i < opts.length; i++) {
            votes.push(0);
        }
        poll.options.votes = votes;

        if ($DEBUG) console.log(
            "addPoll: BEFORE saving new poll: " + JSON.stringify(poll));

        poll.save(function(err) {
            if (err) {
                if ($DEBUG) {
                    console.log("addPoll save had errors");
                }
                return handleError(err, req, res);
            }

            if ($DEBUG) console.log("addPoll ID is " + poll._id);

            // Correct thing would be to remove poll on error because otherwise
            // Poll and User data are inconsistent
            User.findOne({_id: user._id}, function(err, result) {
                if (err) return handleError(err, req, res);

                result.polls.push(poll._id);
                var setOpt = {$set: {
                    polls: result.polls,
                }};

                User.update({_id:result._id}, setOpt, {}, function(err) {
                    if (err) return handleError(err, req, res);
                    var pollURI = encodeURIComponent(poll.name);
                    var msg = {
                        msg: "New poll has been created.",
                        uri: getPollURI(poll.name),
                    };
                    res.json(msg);
                });

            });
        });

	};

    /** Given req and poll object, returns object for filling the pug
     * template. */
    var getPollPugVars = function(req, poll) {
        return {
            pollName: poll.name,
            pollID: poll._id,
            options: poll.options.names,
            votes: poll.options.votes,
            isAuth: req.isAuthenticated(),
            isCreator: isPollCreator(req, poll),
            pollURI: getPollURI(poll.name),
        };
    };

    // Given poll ID in request, serves requested poll as a HTML page
    this.getPollById = function(req, res) {
        if (req.params.id) {
            var pollID = req.params.id;
            Poll.findOne({_id: pollID}, function(err, result) {
                if (err) return handleError(err, req, res);

                if (result) {
                    if ($DEBUG) console.log("getPollByID: " + JSON.stringify(result));
                    var pugVars = getPollPugVars(req, result);
                    res.render(path + "/pug/poll.pug", pugVars);
                }
                else {
                    res.render(path + "/pug/invalid_poll.pug", {pollID: pollID});
                }
            });
        }
        else {
            res.sendStatus(400);
        }
    };

    /** Returns a page rendered for the given poll.*/
    this.getPollByName = function(req, res) {
        if (req.params.id) {
            var pollName = decodeURIComponent(req.params.id);
            console.log("getPollByName: pollName " + pollName);
            // Decode the pollName from URL
            Poll.findOne({name: pollName}, function(err, result) {
                if (err) return handleError(err, req, res);

                if (result) {
                    var pollID = result._id;
                    res.redirect("/polls/" + pollID);
                }
                else {
                    res.render(path + "/pug/invalid_poll.pug", {pollName: pollName});
                }
            });
        }
        else {
            res.sendStatus(400);
        }
    };

    /** Updates poll options on function call.*/
    this.updatePollById = function(req, res) {
        var isAuth = req.isAuthenticated();
        var pollID = req.params.id;
        if (isAuth && pollID) {
            Poll.findOne({_id: pollID}, function(err, poll) {
                if (err) return handleError(err, req, res);

                var optName = req.body.option;
                poll.options.names.push(optName);
                poll.options.votes.push(0);
                updatePollDb(pollID, poll, function(err) {
                    if (err) return handleError(err, req, res);
                    res.redirect("/polls/" + pollID);
                });

            });
        }
        else {
            res.sendStatus(400);
        }
    };

    /** Deletes poll with given ID. Request must come from authenticated user
     * who is creator of the poll. */
    this.deletePollById = function(req, res) {
        var isAuth = req.isAuthenticated();
        var pollID = req.params.id;
        var user = req.user;
        if (pollID && isAuth) {
            Poll.findOne({_id: pollID}, function(err, pollResult) {
                if (err) return handleError(err, req, res);

                if ($DEBUG) console.log(
                    "deletePollByID: " + JSON.stringify(pollResult));

                if (isPollCreator(req, pollResult)) {
                    Poll.remove({_id: pollID}, function(err) {
                        if (err) return handleError(err, req, res);

                        removePollFromUser(pollResult, user, function(err) {

                        });
                        // TODO add nice msg about poll deletion
                        res.redirect("/");
                    });
                }
                else {
                    console.error("An error. Delete from a non-creator.");
                    res.sendStatus(404);
                }
            });
        }
        else {
            res.sendStatus(404);
        }
    };

    /** Adds one vote to the poll. TODO prevent double-voting by the same user.*/
    this.addVoteOnPoll = function(req, res) {
        var i = 0;
        var pollID = req.params.id;
        Poll.findOne({_id: pollID}, function(err, poll) {
            if (err) return handleError(err, req, res);

            if ($DEBUG) {
                console.log("addVoteOnPoll req.body: " + JSON.stringify(req.body));
                console.log("Vote came from IP: " + req.ip);
            }

            // Check if this user has voted already in this poll
            var index = 0;
            var voters = poll.info.voters;

            if (req.isAuthenticated()) {
                var username = req.user.username;
                index = voters.indexOf(username);
                if (index === -1) poll.info.voters.push(username);
            }
            else {
                // Check that no vote came from the IP before
                var voteIP = req.ip;
                index = voters.indexOf(voteIP);
                if (index === -1) poll.info.voters.push(voteIP);
            }

            if (index >= 0) {
                var pugVars = getPollPugVars(req, poll);
                pugVars.alreadyVoted = true;
                return res.render(path + "/pug/poll.pug", pugVars);
            }

            // Find the voted option position and add a vote
            var options = poll.options.names;
            var votedOption = req.body.option;
            for (i = 0; i < options.length; i++) {
                if (votedOption === options[i]) {
                    poll.options.votes[i] += 1;
                    if ($DEBUG) {
                        console.log("addVoteOnPoll voted option: " + votedOption);
                    }
                }
            }

            updatePollDb(pollID, poll, function(err){
                if (err) return handleError(err, req, res);
                res.redirect("/polls/" + pollID);
            });


        });
    };

};

