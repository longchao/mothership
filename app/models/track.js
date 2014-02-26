var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrackSchema = new Schema({
    sync: {
        type: Boolean,
        default: false
    },
    header: {
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
            required: true
        },
        time: Date
    },
    data: {
        event: {
            type: String,
            required: true
        },
        properties: {}
    }
});


TrackSchema.path('header.time').validate(function (time) {
    return ( typeof time != 'undefined' && time < Date.now());
}, 'time should cannot be future.');

var Track = mongoose.model('Track', TrackSchema);
