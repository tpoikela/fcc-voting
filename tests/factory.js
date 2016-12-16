
const mocks = require("node-mocks-http");
const sinon  = require("sinon");

/** Contains some helper method for unit testing that requires req/res
 * objects.*/
module.exports = {

    getMockedReq: function() {
        var req = mocks.createRequest();
        req.isAuthenticated = function() {return true;};
        return req;
    },

    getMockedRes: function() {
        var res = mocks.createResponse();
        sinon.stub(res, "json");
        sinon.stub(res, "render");
        sinon.stub(res, "redirect");
        return res;

    },

    restoreRes: function(res) {
        res.json.restore();
        res.render.restore();
        res.redirect.restore();
    },


    createUser: function() {
        return {_id: 1234, username: "TestUser", polls: []};
    },

};
