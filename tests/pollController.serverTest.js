
const expect = require("chai").expect;
const sinon  = require("sinon");

const mocks = require("node-mocks-http");

var User = require("../app/models/users");
var Poll = require("../app/models/polls");

var PollController = require("../app/controllers/pollController.server");

describe('How pollController on server side works', function() {

    var req = null;
    var res = null;
    var ctrl = null;

    beforeEach(function() {
        req = mocks.createRequest();

        res = mocks.createResponse();
        //res.json = sinon.stub(); // Stub out res.json()
        sinon.stub(res, "json");

        ctrl = new PollController(process.cwd());
    });

    afterEach(function() {
        res.json.restore();
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
        var findOne = sinon.stub(Poll, "findOne");
        findOne.yields(null, expected);

        req.params = {id: 1234};
        ctrl.getPollAsJSON(req, res);

        expect(res.statusCode).to.equal(200);
        expect(res.json.calledWith(expected)).to.be.true;

    });

    it('Adds one poll into the database', function() {
        var expMsg = {msg: "New poll has been created."};
        var user = {_id: 1234, username: "TestUser", polls: []};
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
        });

    });

});
