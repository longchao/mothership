var http = require('http');
var mongoose = require('mongoose');
var queryString = require('querystring');
var Track = mongoose.model('Track');
var config = require('../../config/config');


exports.create = function (req, res) {
    var track = new Track(req.body);
    // Build the post string from an object

    var saveErr = function (err) {
        if (err) {
            console.log(err.message + JSON.stringify(req.body));
            return res.send(400, {message: err.message});
        } else {
            return res.send(201, {message: 'success'});
        }
    };
    upload(track, saveErr);
}

var upload = function (track, saveErr) {

    track.headers.time = Date.now();

    var mixFormat = track.data.toObject();
    for (var key in track.headers.toObject()) {
//        console.log(key);
        mixFormat.properties[key] = track.headers[key];
    }

    var data = queryString.stringify({
        data: new Buffer(JSON.stringify(mixFormat)).toString('base64'),
        api_key: config.api_key
    });

    var options = config.mixpanel;
    options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
    }

    // Set up the request
    var req2 = http.request(options, function (res2) {
        res2.setEncoding('utf8');
        res2.on('data', function (chunk) {
            console.log('ready to save,%s', JSON.stringify(mixFormat));
            track.sync = (chunk.toString().trim() == '1');
            console.log('upload: ' + track.sync);
            track.save(saveErr);
        });
        res2.on('error', function (e) {
            console.log(e.message + "---" + JSON.stringify(mixFormat));
            track.save(saveErr);
        })
    });
    req2.on('error', function (e) {
        console.log(e.message + "---" + JSON.stringify(mixFormat));
        track.save(saveErr);
    })

    // request the data
    req2.write(data);
    req2.end();
}

exports.upload = upload;