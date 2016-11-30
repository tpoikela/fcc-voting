
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nameValidator = function(v) {
    return /^[^<>]+$/.test(v);
};

var arrayNameValidator = function(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (!nameValidator(arr[i])) return false;
    }
    return true;
};

var Poll = new Schema({
    name: {
        type: String, 
        required: [true, "Poll name required"],
        validate: {
            validator: nameValidator,
            message: "Name cannot contain < or >.",
        },
    },
    options: {
        names: {
            type: [String],
            validate: {
                validator: arrayNameValidator,
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
                validator: nameValidator,
                message: "Creator name cannot contain < or >.",
            },
        },
        voters: {
            type: [String],
            validate: {
                validator: arrayNameValidator,
                message: "Voter name cannot contain < or >.",
            },
        },

    },
});

module.exports = mongoose.model('Poll', Poll);

