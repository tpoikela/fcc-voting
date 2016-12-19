
const expect = require("chai").expect;
const sinon  = require("sinon");

var Fact = require("./factory");

var User = require("../app/models/users");
var Poll = require("../app/models/polls");

var PollController = require("../app/controllers/pollController.server");

var app_url = "http://127.0.0.1:8080";

var createPoll = function() {
    return {name: "poll", _id: 1234,
        options: {names: [], votes:[]},
        info: {creator: "xxx", voters: []},
    };
};

/** Returns object containing variables needed in .pug templates.*/
var getPugVars = function(user, poll) {
    var isCreator = user.username === poll.info.creator;
    return {pollName: poll.name,
        pollID: poll._id,
        options: [], votes:[],
        isAuth: true,
        isCreator: isCreator,
        pollURI: app_url + "/p/" + encodeURIComponent(poll.name),
    };
};


describe('How pollController on server side works', function() {

    var req = null;
    var res = null;
    var ctrl = null;

    var pollFindOne = null;
    var pollUpdate = null;
    var pollRemove = null;

    var userUpdate = null;
    var userFindOne = null;

    beforeEach(function() {
        // Mock req/res for all unit tests
        req = Fact.getMockedReq();
        res = Fact.getMockedRes();

        ctrl = new PollController(process.cwd(), app_url);

        pollFindOne = sinon.stub(Poll, "findOne");
        pollUpdate  = sinon.stub(Poll, "update");
        pollRemove = sinon.stub(Poll, "remove");

        userUpdate = sinon.stub(User, "update");
        userFindOne = sinon.stub(User, "findOne");
    });

    afterEach(function() {
        Fact.restoreRes(res);

        pollFindOne.restore();
        pollUpdate.restore();
        pollRemove.restore();

        userUpdate.restore();
        userFindOne.restore();
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
        sinon.assert.calledWith(res.json, expected);

    });

    it('should add one poll into the database', function(done) {

        var expMsg = {
            msg: "New poll has been created.",
            uri: app_url + "/p/" + encodeURIComponent("Test Poll?"),
        };

        var user = Fact.createUser();
        userFindOne.yields(null, user);
        userUpdate.yields(null);

        pollFindOne.yields(null, null);

        Poll.prototype.save = function(cb) {cb(null);};

        req.body.name = "Test Poll?";
        req.body.options = ["A", "B", "C", "D"];
        req.user = user;

        Promise.all([ctrl.addPoll(req, res)]).then(function() {
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, expMsg);
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
        req.user = Fact.createUser();
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
        req.user = Fact.createUser();
        req.params = {id: expId};

        pollFindOne.yields(null, pollObj);
        pollUpdate.yields(null);

        Promise.all([ctrl.addVoteOnPoll(req, res)]).then(function() {
            sinon.assert.calledOnce(res.redirect);
            sinon.assert.calledWith(res.redirect, "/polls/" + expId);
            done();
        });

    });

    it('should retrieve poll by name', function(done) {
        var pollName = "TestPollName";
        var poll = createPoll();
        var user = Fact.createUser();

        user.username = "yyy";
        poll.name = pollName;
        req.params.id = pollName;

        pollFindOne.yields(null, poll);

        Promise.all([ctrl.getPollByName(req, res)]).then(function() {
            sinon.assert.calledWith(res.redirect, "/polls/" + poll._id);
            done();
        });
    });


    //---------------------------------------------------------------------------
    // ERROR tests
    //---------------------------------------------------------------------------

    it('should reject a voter already voted', function(done) {
        var poll = createPoll();
        var user = Fact.createUser();
        req.user = user;
        user.username = "Test User";
        poll.info.voters.push(user.username);

        var expPath = process.cwd() + "/pug/poll.pug";
        var expVars = getPugVars(user, poll);
        expVars.alreadyVoted = true;

        pollFindOne.yields(null, poll);

        Promise.all([ctrl.addVoteOnPoll(req, res)]).then(function() {
            sinon.assert.calledWith(res.render, expPath, expVars);
            done();
        });
    });

});
