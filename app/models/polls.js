
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const Validation = require('../common/validation.js');

var validator = new Validation();

/** Schema for one poll in the database.*/
var Poll = new Schema({

    name: {
        type: String,
        required: [true, "Poll name required"],
        validate: {
            validator: validator.validateName,
            message: "Name cannot contain < or >.",
        },
    },
    options: {
        names: {
            type: [String],
            validate: {
                validator: validator.validateNameArray,
                message: "Opt name cannot contain < or >.",
            },
        },
        votes: [Number],
    },

    // Contains info about creator and voters of the poll
    info: {
        creator: {
            type: String,
            required: [true, "Each poll must have a creator."],
            validate: {
                validator: validator.validateName,
                message: "Creator name cannot contain < or >.",
            },
        },
        voters: {
            type: [String],
            validate: {
                validator: validator.validateNameArray,
                message: "Voter name cannot contain < or >.",
            },
        },

    },
},
{collection: "vote_polls"}
);

module.exports = mongoose.model('Poll', Poll);

