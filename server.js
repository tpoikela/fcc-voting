'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();
app.set("view engine", "pug");


require('dotenv').load();
require('./app/config/passport')(passport);

app.url = process.env.APP_URL;
console.log("APP url: " + app.url);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use('/pug', express.static(process.cwd() + '/pug'));

app.use(session({
	secret: process.env.SECRET || 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.locals.pretty = true;

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: false}));

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
