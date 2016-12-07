
const chai = require("chai");
const expect = chai.expect;

const User = require("../app/models/users.js");

const Poll = require("../app/models/polls.js");

describe('User Schema', function() {

    it('should have a username', function() {
        var user = new User();
        var poll = new Poll();
        poll.save(function(err) {
            user.polls.push(poll._id);
            var error = user.validateSync();
            expect(error.errors).to.not.have.property("polls");

        });
    });
});
