'use strict';

var path = process.cwd();
const UserController = require(path + '/app/controllers/userController.server.js');
const PollController = require(path + '/app/controllers/pollController.server.js');

var $DEBUG = 0;

var _log = function(msg) {
    console.log("\t" + msg);
};

/** Function for debug logging request.*/
var reqDebug = function(req) {
	_log("Headers: " + JSON.stringify(req.headers));
	_log("Body: "    + JSON.stringify(req.body));
	_log("Params: "  + JSON.stringify(req.params));
	_log("Url:"      + JSON.stringify(req.url));
	_log("Text:"     + JSON.stringify(req.text));
	_log("Content:"  + JSON.stringify(req.content));
	_log("Query:"    + JSON.stringify(req.query));
};

module.exports = function (app, passport) {

    /** Renders a pug template.*/
    var renderPug = function(req, res, pugFile) {
        var isAuth = req.isAuthenticated();
        res.render(path + "/pug/" + pugFile, {isAuth: isAuth});
    };

    /** loggedIn func from clementine.js. */
	var isLoggedIn = function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

    var userController = new UserController(path);
	var pollController = new PollController(path, app.url);

	app.route('/')
		.get(function (req, res) {
            renderPug(req, res, "index.pug");
		});

	app.route('/signup')
		.get(function (req, res) {
            renderPug(req, res, "signup.pug");
		});

	app.route('/login')
		.get(function (req, res) {
            renderPug(req, res, "login.pug");
		});

	app.route('/loginFailed')
		.get(function (req, res) {
            res.render(path + "/pug/login.pug", 
                {isAuth: false, loginFailed: true});
        });

    // If a user logs out, return to main page
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

    app.route('/create')
        .get(isLoggedIn, function(req, res) {
            renderPug(req, res, "create.pug");
        });

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
            renderPug(req, res, "profile.pug");
		});

    // Handle registration of user
    app.route('/forms/signup')
        .post(function(req, res) {
            if ($DEBUG) {
                console.log("Got a signup form GET request..");
                reqDebug(req);
            }
            userController.addLocalUser(req, res);
        });


    //----------------------------------------------------
    // Routes for getting/creating/deleting/updating polls
    //----------------------------------------------------

    app.route('/polls')
        .get(function(req, res) {
            pollController.getPolls(req, res);
        });

    app.route('/polls/create')
        .post(isLoggedIn, function(req, res) {
            pollController.addPoll(req, res);
        });

    app.route('/polls/vote/:id')
        .post(function(req, res) {
            pollController.addVoteOnPoll(req, res);
        });

    app.route('/polls/update/:id')
        .post(function(req, res) {
            pollController.updatePollById(req, res);
        });

    app.route('/polls/delete/:id')
        .get(function(req, res) {
            pollController.deletePollById(req, res);
        });

    app.route('/polls/getpolls/:id')
        .get(function(req, res) {
            pollController.getPollAsJSON(req, res);
        });

    app.route('/polls/:id')
        .get(function(req, res) {
            pollController.getPollById(req, res);
        });

    app.route('/p/:id')
        .get(function(req, res) {
            pollController.getPollByName(req, res);
        });
    //--------------------------------------
    // User registration and authentication
    //--------------------------------------

	app.route('/api/:id')
		.get(function (req, res) {
            userController.getUser(req, res);
		});

    // Logs user in via form (after successful authentication
	app.route('/auth/userlogin')
        .post(passport.authenticate('local', 
            { failureRedirect: '/loginFailed' }),
		function(req, res) {
			res.redirect('/');
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/loginFailed'
		}));

};
