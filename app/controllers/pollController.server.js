
const url = require('url');

const Poll = require("../models/polls.js");

module.exports = function(path) {

    var $DEBUG = 1;

    /** Returns true is request came from poll's creator.*/
    var isPollCreator = function(req, poll) {
        if (req.hasOwnProperty("user")) {
            return req.user.local.username === poll.info.creator;
        }
        else {
            return false;
        }
    };

    /** Finds all polls from the database and returns their name.*/
    this.getPolls = function(req, res) {
        Poll.find({}, {name: 1, _id: 1}, function(err, result) {
            if (err) throw err;
            if ($DEBUG) console.log("getPolls: " + JSON.stringify(result));
            res.json(result);
        });
    };

	/** Adds one poll into the database. */
	this.addPoll = function(req, res) {
        var user = req.user;
        var poll = new Poll();

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
            "addPoll: Saving new poll: " + JSON.stringify(poll));

        poll.save(function(err) {
            if (err) throw err;
            res.redirect("/");
        });

	};

    // Serves requested poll as a HTML page
    this.getPollById = function(req, res) {
        var isAuth = req.isAuthenticated();
        if (req.params.id) {
            var pollID = req.params.id;
            Poll.findOne({_id: pollID}, function(err, result) {
                if (err) throw err;

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
                if (err) throw err;

                var optName = req.body.option;
                poll.options.names.push(optName);
                poll.options.votes.push(0);

                poll.update(function(err) {
                    if (err) throw err;
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
        if (pollID && isAuth) {
            Poll.findOne({_id: pollID}, function(err, result) {
                if (err) throw err;

                if ($DEBUG) console.log(
                    "deletePollByID: " + JSON.stringify(result));

                if (isPollCreator(req, result)) {
                    Poll.remove({_id:pollID}, function(err) {
                        if (err) throw err;
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
        var pollID = req.params.id;
        Poll.findOne({_id: pollID}, function(err, poll) {
            if (err) throw err;

            if ($DEBUG) {
                console.log("voteOnPoll req.body: " + JSON.stringify(req.body));
            }

            var votedOption = req.body.option;
            var options = poll.options.names;

            for (var i = 0; i < options.length; i++) {
                if (votedOption === options[i]) {
                    poll.options.votes[i] += 1;
                    if ($DEBUG) {
                        console.log("voteOnPoll voted option: " + votedOption);
                    }
                }
            }

            var setOp = {$set: {"options.votes": poll.options.votes}};
            var opts = {};

            Poll.update({_id: pollID}, setOp, opts, function(err) {
                if (err) throw err;
                res.redirect("/polls/" + pollID);
            });
            /*
            poll.update(function(err) {
                if (err) throw err;
                console.log("voteOnPoll Poll saved OK: " + JSON.stringify(poll));
                res.redirect("/polls/" + pollID);
            });
           */

        });
    };

};

