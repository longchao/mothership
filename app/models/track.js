var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/config');

var TrackSchema = new Schema({
    sync: {
        type: Boolean,
        default: false
    },
    headers: {
        distinct_id: {
            type: String,
            required: true
        },
        ip: {
            type: String,
            required: true
        },
        token: {
            type: String,
            default: config.token
        },
        time: {
            type: Date,
            required: true
        }
    },
    data: {
        event: {
            type: String,
            required: true
        },
        properties: {}
    }
});


TrackSchema.path('headers.time').validate(function (time) {
    return ( typeof time != 'undefined' && time < Date.now());
}, 'time should cannot be future.');

var Track = mongoose.model('Track', TrackSchema);
