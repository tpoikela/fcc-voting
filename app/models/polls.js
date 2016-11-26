
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
	name: String,
    options: {
        names: [String],
        votes: [Number],
    },
    info: {
        creator: String,
        voters: [String],
    },
});

module.exports = mongoose.model('Poll', Poll);

