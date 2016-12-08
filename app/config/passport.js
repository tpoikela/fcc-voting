'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

var LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new GitHubStrategy({
		clientID: configAuth.githubAuth.clientID,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackURL: configAuth.githubAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
            var username = profile.username;
			User.findOne({ 'github.id': profile.id }, function (err, user) {
				if (err) {
					return done(err);
				}

				if (user) {
					return done(null, user);
				} else {

                    // Must check if a user with same name exists in local
                    User.findOne({'username': username}, function(err, user) {
                        if (!user) {
                            var newUser = new User();

                            newUser.username = profile.username;
                            newUser.github.id = profile.id;
                            newUser.github.username = profile.username;
                            newUser.github.displayName = profile.displayName;

                            newUser.save(function (err) {
                                if (err) {
                                    return done(err, false);
                                }

                                return done(null, newUser);
                            });
                        }
                        else {
                            console.log("Cannot accept github.id Local user exists");
                            return done(null, false);
                        }

                    });


				}
			});
		});
	}));

	// Strategy for local password verification
    passport.use(new LocalStrategy({

		// These are defaults, so no need to specify them
		//userNameField: "username",
		//passwordField: "password",
		//passReqToCallback: true,

		session: true,
		},
		function(username, password, done) {
			User.findOne({"local.username": username}, function(err, user) {
			  if (err) { return done(err); }
			  if (!user) { return done(null, false); }
			  if (user.local.password !== password) { return done(null, false); }
			  return done(null, user);
			});
		}
	));

};
