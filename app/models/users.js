'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

/** A schema for an user in the database.*/
var User = new Schema({

    //username: {required: true, type: String},

    // Bit tricky to support 2 usernames, change to one only?
    github: {
        id: String,
        displayName: String,
        username: String,
        publicRepos: Number
    },
    local: {
        username: String,
        password: String, // TODO use bcrypt to handle this
    },
    polls: [{type: ObjectId, ref: 'Poll' }],
});

module.exports = mongoose.model('User', User);

