

/** Represents one poll in the voting app. */
var Poll = function(name, owner) {

    this.owner    = owner;
    this.name     = name;
    this.options  = [];
    this.numVotes = {};
    this.voters   = {};

};

Poll.prototype.getOwner = function() {
    return this.owner;
};

Poll.prototype.hasVoted = function(voterName) {
    return this.voters.hasOwnProperty(voterName);
};

Poll.prototype.addOption = function(name) {
    this.options.push(name);
    this.numVotes[name] = 0;
};

/** Sets the options for poll. Initializes also numVotes for each option to 0.*/
Poll.prototype.setOptions = function(options) {
    this.options = options;
    for (var i = 0; i < options.length; i++) {
        this.numVotes[options[i]] = 0;
    }
};

Poll.prototype.getVotes = function(option) {
    if (this.numVotes.hasOwnProperty(option)) {
        return this.numVotes[option];
    }

};

Poll.prototype.vote = function(voterName, option) {
    if (this.numVotes.hasOwnProperty(option)) {
        this.numVotes[option] += 1;
        this.voters[voterName] = true;
    }
};

module.exports = Poll;

