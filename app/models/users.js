'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    github: {
        id: String,
        displayName: String,
        username: String,
        publicRepos: Number
    },
    local: {
        username: String,
        password: String,
    },
    nbrClicks: {
        clicks: Number
    }
});

module.exports = mongoose.model('User', User);

