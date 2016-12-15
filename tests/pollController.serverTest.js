
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
        ctrl = new PollController(process.cwd());
    });

    afterEach(function() {

    });

    it('should return all polls as a result', function() {
        var expected = {a: "b", c: "d", e: "f"};
        var find = sinon.stub(Poll, "find");
        find.yields(null, expected);

        ctrl.getPolls(req, res);

        expect(res.statusCode).to.equal(200);

    });

    it('returns requested poll as JSON', function() {
        var expected = {_id: 1234, name: "xxX"};
        var findOne = sinon.stub(Poll, "findOne");
        findOne.yields(null, expected);

        req.params = {id: 1234};
        ctrl.getPollAsJSON(req, res);

        expect(res.statusCode).to.equal(200);

    });

});
