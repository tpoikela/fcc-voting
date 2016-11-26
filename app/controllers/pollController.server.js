
const url = require('url');

const Poll = require("../models/polls.js");

module.exports = function() {

    /** Finds all polls from the database and returns their name.*/
    this.getPolls = function(req, res) {
        Poll.find({}, {name: 1, _id: 0}, function(err, result) {
            if (err) throw err;
            console.log(JSON.stringify(result));
            res.json(result);
        });
    };

	/** Handles adding of polls.*/
	this.addPoll = function(req, res) {
        var user = req.user;
        var poll = new Poll();

        // Extract name and options from post-request
        poll.name = req.body.name;
        var opts = req.body.options.split(",");
        poll.options.names = opts;

        var votes = [];
        for (var i = 0; i < poll.options.names.length; i++) {
            votes.push(0);
        }
        poll.options.votes = votes;

        console.log("New poll will be saved now.");
        poll.save(function(err) {
            if (err) throw err;
            res.redirect("/");
        });

	};

};

