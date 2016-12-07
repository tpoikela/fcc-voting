
/** No requires. Run this on browser with tests/ajax.html.*/

var expect = chai.expect;

describe('Ajax functions of Votingn app', function() {

	var xhr, requests;

	beforeEach(function () {
		xhr = sinon.useFakeXMLHttpRequest();
		requests = [];
		xhr.onCreate = function (req) { requests.push(req); };
	});

	afterEach(function () {
		// Like before we must clean up when tampering with globals.
		xhr.restore();
	});

	// Test GET
    it('makes getRequests to query for user info', function(done) {
        var userData = {"username": "testUser"};
        var dataJSON = JSON.stringify(userData);

		ajaxFunctions.ajaxRequest("GET", "/testUrl", function(res) {
            var respData = JSON.parse(res);
            expect(respData).deep.equal(userData);
            done();
		});

        requests[0].respond(200, {'Content-Type': 'text/json'}, dataJSON);

    });

	//	Test POST
    it('Sends updated poll info via post requests', function(done) {

        var pollData = {"opt": 1, "name": "xxx"};

		ajaxFunctions.ajaxRequest("POST", "/testUrl", function(res) {
            var respData = JSON.parse(res);
            expect(respData).deep.equal(userData);
            done();
		}, pollData);

        expect(requests[0].requestBody).to.equal(pollData);

    });

});
