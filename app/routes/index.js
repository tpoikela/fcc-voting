'use strict';

var path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
const UserHandler = require(path + '/app/controllers/userController.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();
    var userHandler = new UserHandler();

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
            console.log("Got a signup form.");
            res.redirect('/login');
        });

    app.route('/polls')
        .get(function(req, res) {
            res.json(["aaaa", "bbbb"]);
        });

    app.route('/polls/create')
        .post(isLoggedIn, function(req, res) {
            console.log("Received a poll.");
            res.sendStat(200);
        });

    app.route('/polls/:id')
        .get(function(req, res) {
            res.json(["aaaa", "bbbb"]);
        });

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

    // Logs user in via form
	app.route('/auth/userlogin')
        .post(function(req, res) {

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
