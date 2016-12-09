
const url = require('url');

const Poll = require("../models/polls.js");
const User = require("../models/users.js");

module.exports = function(path) {

    var $DEBUG = 1;

    var handleError = function(err, res) {
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
                    //res.json({msg: "New poll has been created."});
                    cb(null); // No error, everything OK
                });
            }

        });
    };

    /** Finds all polls from the database and returns their names and IDs.*/
    this.getPolls = function(req, res) {
        Poll.find({}, {name: 1, _id: 1}, function(err, result) {
            if (err) return handleError(err, res);
            if ($DEBUG) console.log("getPolls: " + JSON.stringify(result));
            res.json(result);
        });
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
                return handleError(err, res);
            }

            console.log("addPoll ID is " + poll._id);

            // Correct thing would be to remove poll on error because otherwise
            // Poll and User data are inconsistent
            User.findOne({_id: user._id}, function(err, result) {
                if (err) return handleError(err, res);

                result.polls.push(poll._id);
                var setOpt = {$set: {
                    polls: result.polls,
                }};

                User.update({_id:result._id}, setOpt, {}, function(err) {
                    if (err) return handleError(err, res);
                    res.json({msg: "New poll has been created."});
                });

            });
        });

	};

    // Serves requested poll as a HTML page
    this.getPollById = function(req, res) {
        var isAuth = req.isAuthenticated();
        if (req.params.id) {
            var pollID = req.params.id;
            Poll.findOne({_id: pollID}, function(err, result) {
                if (err) return handleError(err, res);

                if (result) {
                    if ($DEBUG) console.log("getPollByID: " + JSON.stringify(result));

                    var pugVars = {
                        pollName: result.name,
                        pollID, pollID,
                        options: result.options.names,
                        votes: result.options.votes,
                        isAuth: isAuth,
                        isCreator: isPollCreator(req, result),
                    };

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

    /** Updates poll options on function call.*/
    this.updatePollById = function(req, res) {
        var isAuth = req.isAuthenticated();
        var pollID = req.params.id;
        if (isAuth && pollID) {
            Poll.findOne({_id: pollID}, function(err, poll) {
                if (err) return handleError(err, res);

                var optName = req.body.option;
                poll.options.names.push(optName);
                poll.options.votes.push(0);
                updatePollDb(pollID, poll, function(err) {
                    if (err) return handleError(err, res);
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
                if (err) return handleError(err, res);

                if ($DEBUG) console.log(
                    "deletePollByID: " + JSON.stringify(pollResult));

                if (isPollCreator(req, pollResult)) {
                    Poll.remove({_id: pollID}, function(err) {
                        if (err) return handleError(err, res);

                        removePollFromUser(pollResult, user, function(err) {

                        });
                        // TODO add nice msg about poll deletion
                        res.redirect("/");
                    });
                }
                else {
                    res.sendStatus(404);
                }
            });
        }
        else {
            res.sendStatus(404);
        }
    };

    /** Adds one vote to the poll. TODO prevent double-voting by the same user.*/
    this.voteOnPoll = function(req, res) {
        var i = 0;
        var pollID = req.params.id;
        Poll.findOne({_id: pollID}, function(err, poll) {
            if (err) return handleError(err, res);

            if ($DEBUG) {
                console.log("voteOnPoll req.body: " + JSON.stringify(req.body));
                console.log("Vote came from IP: " + req.ip);
            }

            var votedOption = req.body.option;
            var options = poll.options.names;

            // Check that no vote came from the IP before
            var voteIP = req.ip;
            var voters = poll.info.voters;
            var index = voters.indexOf(voteIP);

            if (index >= 0) return res.json({msg: "You have already voted."});
            else poll.info.voters.push(voteIP);

            // Find the voted option position and add a vote
            for (i = 0; i < options.length; i++) {
                if (votedOption === options[i]) {
                    poll.options.votes[i] += 1;
                    if ($DEBUG) {
                        console.log("voteOnPoll voted option: " + votedOption);
                    }
                }
            }

            updatePollDb(pollID, poll, function(err){
                if (err) return handleError(err, res);
                res.redirect("/polls/" + pollID);
            });


        });
    };

};

