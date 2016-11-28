'use strict';

var path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
const UserController = require(path + '/app/controllers/userController.server.js');
const PollController = require(path + '/app/controllers/pollController.server.js');

var reqDebug = function(req) {
	console.log("Headers: " + JSON.stringify(req.headers));
	console.log("Body: " + JSON.stringify(req.body));
	console.log("Params: " + JSON.stringify(req.params));
	console.log("Url:" + JSON.stringify(req.url));
	console.log("Text:" + JSON.stringify(req.text));
	console.log("Content:" + JSON.stringify(req.content));
	console.log("Query:" + JSON.stringify(req.query));
};

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();
    var userController = new UserController();
	var pollController = new PollController(path);

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/signup')
		.get(function (req, res) {
			res.sendFile(path + '/public/signup.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

    // If user logs out, return to main page
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

    app.route('/create')
        .get(isLoggedIn, function(req, res) {
            res.sendFile(path + '/public/create.html');
        });

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

    // Handle registration of user
    app.route('/forms/signup')
        .post(function(req, res) {
            console.log("Got a signup form GET request..");
			reqDebug(req);
            userController.addUser(req, res);
        });

    app.route('/polls')
        .get(function(req, res) {
            pollController.getPolls(req, res);
        });

    app.route('/polls/create')
        .post(isLoggedIn, function(req, res) {
            reqDebug(req);
            pollController.addPoll(req, res);
        });

    app.route('/polls/:id')
        .get(function(req, res) {
            pollController.getPollById(req, res);
            //res.json(["aaaa", "bbbb"]);
        });

	app.route('/api/:id')
		.get(function (req, res) {
            if (req.isAuthenticated()) {
                console.log("Req auth, user " + JSON.stringify(req.user));
                if (req.user.github.username) {
                    res.json(req.user.github);
                }
                else if (req.user.local.username) {
                    res.json(req.user.local);
                }
                else
                    res.sendStatus(400); // Something went wrong terribly
            }
            else {
                res.json({name: "guest"});
            }
		});

    // Logs user in via form (after successful authentication
	app.route('/auth/userlogin')
        .post(passport.authenticate('local', { failureRedirect: '/login' }),
		function(req, res) {
			res.redirect('/');
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
