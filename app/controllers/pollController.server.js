
const url = require('url');

const Poll = require("../models/polls.js");

module.exports = function(path) {

    /** Finds all polls from the database and returns their name.*/
    this.getPolls = function(req, res) {
        Poll.find({}, {name: 1, _id: 1}, function(err, result) {
            if (err) throw err;
            console.log(JSON.stringify(result));
            res.json(result);
        });
    };

	/** Handles adding of polls into the database. */
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

        console.log("New poll will be saved now.");
        poll.save(function(err) {
            if (err) throw err;
            res.redirect("/");
        });

	};

    // Serves requested poll as a HTML page
    this.getPollById = function(req, res) {
        if (req.params.id) {
            var pollID = req.params.id;
            Poll.findOne({_id: pollID}, function(err, result) {
                if (err) throw err;
                console.log("getPollByID: " + JSON.stringify(result));
                var pugVars = {
                    pollName: result.name,
                    options: result.options.names,
                    votes: result.options.votes,
                };
                res.render(path + "/pug/poll.pug", pugVars);
            });
        }
        else {
            res.sendStatus(400);
        }
    };

};

