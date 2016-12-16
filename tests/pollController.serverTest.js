
const expect = require("chai").expect;
const sinon  = require("sinon");

const mocks = require("node-mocks-http");

var User = require("../app/models/users");
var Poll = require("../app/models/polls");

var PollController = require("../app/controllers/pollController.server");

var createPoll = function() {
    return {name: "poll", _id: 1234,
        options: {names: [], votes:[]},
        info: {creator: "xxx", voters: []},
    };
};

var createUser = function() {
    return {_id: 1234, username: "TestUser", polls: []};
};

describe('How pollController on server side works', function() {

    var req = null;
    var res = null;
    var ctrl = null;

    var pollFindOne = null;
    var pollUpdate = null;
    var pollRemove = null;

    beforeEach(function() {
        // Mock req/res for all unit tests
        req = mocks.createRequest();
        res = mocks.createResponse();

        sinon.stub(res, "json");
        sinon.stub(res, "render");
        sinon.stub(res, "redirect");

        req.isAuthenticated = function() {return true;};

        ctrl = new PollController(process.cwd());

        pollFindOne = sinon.stub(Poll, "findOne");
        pollUpdate  = sinon.stub(Poll, "update");
        pollRemove = sinon.stub(Poll, "remove");
    });

    afterEach(function() {
        res.json.restore();
        res.render.restore();
        res.redirect.restore();
        pollFindOne.restore();
        pollUpdate.restore();
        pollRemove.restore();
    });

    it('should return all polls as a result', function() {
        var expected = {a: "b", c: "d", e: "f"};
        var find = sinon.stub(Poll, "find");
        find.yields(null, expected);

        ctrl.getPolls(req, res);

        expect(res.statusCode).to.equal(200);
        expect(res.json.calledWith(expected)).to.be.true;

    });

    it('returns requested poll as JSON', function() {
        var expected = {_id: 1234, name: "xxX"};
        pollFindOne.yields(null, expected);

        req.params = {id: 1234};
        ctrl.getPollAsJSON(req, res);

        expect(res.statusCode).to.equal(200);
        expect(res.json.calledWith(expected)).to.be.true;

    });

    it('Adds one poll into the database', function(done) {
        var expMsg = {msg: "New poll has been created."};
        var user = createUser();
        var userFindOne = sinon.stub(User, "findOne");
        userFindOne.yields(null, user);

        var userUpdate = sinon.stub(User, "update");
        userUpdate.yields(null);

        var pollSaveMock = sinon.mock(Poll);
        Poll.prototype.save = function(cb) {cb(null);};

        req.body.name = "TestPoll";
        req.body.options = ["A", "B", "C", "D"];

        req.user = user;

        Promise.all([ctrl.addPoll(req, res)]).then(function() {
            sinon.assert.calledOnce(res.json);
            expect(res.json.calledWith(expMsg));
            done();
        });

    });

    it('serves requested poll as HTML page', function(done) {
        var pollObj = createPoll();
        req.params = {id: 1234};
        pollFindOne.yields(null, pollObj);

        Promise.all([ctrl.getPollById(req, res)]).then(function() {
            sinon.assert.calledOnce(res.render);
            sinon.assert.calledWith(res.render, process.cwd() + "/pug/poll.pug");
            done();
        });
    });

    it('should update poll by ID number', function(done) {
        var pollObj = createPoll();
        req.params = {id: 1234};

        // Set-up stub yields
        pollFindOne.yields(null, pollObj);
        pollUpdate.yields(null);

        // Run tested function using Promise
        Promise.all([ctrl.updatePollById(req, res)]).then(function() {
            sinon.assert.calledOnce(res.redirect);
            sinon.assert.calledWith(res.redirect, "/polls/" + req.params.id);
            done();
        });

    });

    it('should delete poll by ID number', function(done) {
        var pollObj = createPoll();
        req.params = {id: pollObj._id};
        req.user = createUser();
        req.user.username = pollObj.info.creator;

        pollFindOne.yields(null, pollObj);
        pollRemove.yields(null);

        Promise.all([ctrl.deletePollById(req, res)]).then(function() {
            sinon.assert.calledOnce(res.redirect);
            sinon.assert.calledWith(res.redirect, "/");

            done();
        });


    });

    it('Should add one vote on poll', function(done) {
        var pollObj = createPoll();
        pollObj._id = 12345567457357635;
        var expId = pollObj._id;
        req.user = createUser();
        req.params = {id: expId};

        pollFindOne.yields(null, pollObj);
        pollUpdate.yields(null);

        Promise.all([ctrl.addVoteOnPoll(req, res)]).then(function() {
            sinon.assert.calledOnce(res.redirect);
            sinon.assert.calledWith(res.redirect, "/polls/" + expId);
            done();
        });

    });

    //---------------------------------------------------------------------------
    // ERROR tests
    //---------------------------------------------------------------------------

    it('should reject a voter already voted', function() {
    });

});
