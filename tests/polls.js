

const chai = require("chai");
const expect = chai.expect;

const Poll = require("../app/models/polls.js");

describe('Poll objects', function() {

    it('should have a name', function() {
        var poll = new Poll();
        poll.name = {};
        var error = poll.validateSync();
        expect(error).to.not.equal(undefined);
        expect(error.errors['name']).to.exist;
        expect(error.errors['options']).to.not.exist;

        poll.name = "<script>alert('xss');</script>";
        error = poll.validateSync();
        expect(error.errors['name']).to.exist;
    });

    it('should have voting options', function() {
        var poll = new Poll();

        poll.options.names = ["a", "b"];
        var error = poll.validateSync();
        expect(error.errors['options.names']).to.equal(undefined);
        poll.options.names = ["<a>", "b"];
        error = poll.validateSync();
        expect(error.errors['options.names']).to.not.equal(undefined);
        expect(error.errors['options.names'].message).to.equal("Opt name cannot contain < or >.");

    });

    it('can contain valid voter names', function() {
        var poll = new Poll();
        poll.info.voters = ["<a<<", "c", "bb"];
        var error = poll.validateSync();
        expect(error.errors["info.voters"]).to.not.equal(undefined);
    });

});
