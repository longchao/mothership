/**
 * Created by 3er on 3/6/14.
 */

var mongoose = require('mongoose');
var School = mongoose.model('School');


exports.create = function (req, res) {
    var school = new School(req.body);

    school.save(function (err) {
        if (err) {
            console.log(err.message + JSON.stringify(req.body));
            return res.send(400, {message: err.message});
        } else {
            return res.json(school);
        }
    });
};

exports.all = function (req, res) {
    School.find().exec(function (err, schools) {
        res.json((err) ? null : schools);
    });
};