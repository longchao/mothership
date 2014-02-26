var mongoose = require('mongoose');
var Track = mongoose.model('Track');

exports.create = function (req, res, next) {
    var track = new Track(req.body);

    track.save(function (err) {
        if (err) {
            console.log(err.message + JSON.stringify(req.body));
            return res.send(400, {message: err.message});
        } else {
            return res.send(201, {message: 'success'});
        }
    });
}


