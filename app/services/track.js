var mongoose = require('mongoose');
var Track = mongoose.model('Track');

var http = require('http');
var querystring = require('querystring');

exports.export = function (url, track) {
    // Build the post string from an object

    var postData = querystring.stringify({
        'api_key':process.env.mixpanel.api_key
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'closure-compiler.appspot.com',
        port: '80',
        path: '/compile',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();
}