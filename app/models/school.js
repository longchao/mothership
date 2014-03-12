/**
 * Created by 3er on 3/5/14.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/config');

var SchoolSchema = new Schema({
    name:  {
        type: String,
        required: true
    },
    port:  {
        type: Number,
        default: config.dl.port
    },
    host:  {
        type: String,
        required: true
    },
    lhost:  {
        type: String,
        default: config.dl.local
    },
    lport:  {
        type: Number,
        default: config.dl.port
    }
});

mongoose.model('School', SchoolSchema);
