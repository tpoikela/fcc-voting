'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Validation = require('../common/validation.js');
var nameValidator = Validation.validateName;
var arrayNameValidator = Validation.validateNameArray;

var ObjectId = mongoose.Schema.Types.ObjectId;

/** A schema for an user in the database.*/
var User = new Schema({

    // Used to access the information in database
    username: {
        required: true,
        type: String,
        validate: {
            validator: nameValidator,
            message: "Name cannot contain < or >",
        },
    },

    // Used for github auth only
    github: {
        id: String,
        displayName: String,
        username: String,
    },

    // Used for local user and password auth
    local: {
        username: String,
        password: String, // TODO use bcrypt to handle this
    },

    // Each poll is referenced by its object ID
    polls: [{type: ObjectId, ref: 'Poll' }],

});

module.exports = mongoose.model('User', User);

