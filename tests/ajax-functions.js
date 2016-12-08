
/** No requires. Run this on browser with tests/ajax.html.*/

var expect = chai.expect;


describe('Ajax function GET failing', function() {

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
        var userData = {"username": "testUser", "password": "qwerty", "obj": {}};
        var dataJSON = JSON.stringify(userData);

		ajaxFunctions.ajaxRequest("GET", "/testUrl", function(err, res) {
            console.log("RES" + res);
            var respData = JSON.parse(res);
            expect(err).to.equal(null);
            expect(respData).deep.equal(userData);
            done();
		});

        requests[0].respond(200, {'Content-Type': 'text/json'}, dataJSON);

    });

    // Test GET receiving 500 (internal server error)
    it('should behave when Get receives 500', function(done) {

		ajaxFunctions.ajaxRequest("GET", "/testUrl", function(err, res) {
            expect(err !== null).to.equal(true);
            expect(err).to.equal(500);
            done();
		});

        requests[0].respond(500);
    });

	//	Test POST
    it('Sends updated poll info via post requests', function(done) {

        var pollData = {"opt": 1, "name": "xxx"};

		ajaxFunctions.ajaxRequest("POST", "/testUrl", function(err) {
            expect(err).to.equal(null);
            done();
		}, pollData);

        expect(requests[0].requestBody).to.equal(pollData);
        requests[0].respond(200);

    });

});

