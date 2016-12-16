
const expect = require("chai").expect;
const sinon  = require("sinon");
const mocks = require("node-mocks-http");

const Fact = require("./factory");

var User = require("../app/models/users");

var UserController = require("../app/controllers/userController.server");

var createUser = function() {
    return {_id: 1234, username: "TestUser", polls: []};
};

describe('How userController on server-side works', function() {

    var req = null;
    var res = null;
    var ctrl = null;

    var userFindOne = null;
    var userSave = null;

    var userPopulate = null;
    var userExec = null;

    beforeEach(function() {
        // Mock req/res for all unit tests
        req = Fact.getMockedReq();
        res = Fact.getMockedRes();

        ctrl = new UserController(process.cwd());

        userFindOne = sinon.stub(User, "findOne");
        userSave = sinon.stub(User.prototype, "save");

        userPopulate = sinon.stub(User, "populate");
        userExec = sinon.stub(User, "exec");

    });

    afterEach(function() {
        Fact.restoreRes(res);
        userFindOne.restore();
        userSave.restore();
        userPopulate.restore();
        userExec.restore();
    });

    it('should add a local user into the database', function(done) {
        var user = Fact.createUser();
        userFindOne.yields(null, null);
        userSave.yields(null);
        req.body = {username: user.username, password: "xxx"};

        Promise.all([ctrl.addLocalUser(req, res)]).then(
            function() {
                sinon.assert.calledOnce(res.render);
                sinon.assert.calledWith(res.render,
                    process.cwd() + "/pug/signup_done.pug",
                    {ok: true, name: user.username});
                done();
            },
            function() {
                throw new Error();
                done();
            }
        );
    });

    it('should not overwrite existing user', function(done) {
        var user = Fact.createUser();
        userFindOne.yields(null, user);
        userSave.yields(null);
        req.body = {username: user.username, password: "xxx"};

        Promise.all([ctrl.addLocalUser(req, res)]).then(
            function() {
                sinon.assert.calledOnce(res.render);
                sinon.assert.calledWith(res.render,
                    process.cwd() + "/pug/signup_done.pug",
                    {ok: false, name: user.username});
                done();
            },
            function() {
                throw new Error();
                done();
            }
        );

    });

    it('should send info about authenticated user', function(done) {
        var user = Fact.createUser();
        req.user = user;

        userExec.yields(user);

        Promise.all([ctrl.getUser(req, res)]).then(function() {
            sinon.assert.calledOnce(res.json);

            done();

        });

    });


});
