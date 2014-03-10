var _ = require("underscore");
var mongoose = require('mongoose');
var schedule = require('node-schedule');
var School = mongoose.model('School');
var am = require('./am');
var http = require('http');
var config = require('../../config/config');

var onError = function (res) {
    res.on('error', function (err) {
        console.log('error:' + err.message);
    });
};

exports.start = function (apps) {
    var mirrors = {};

    var all = function () {
        return mirrors;
    };

    var query = function (apps, school) {
        var results = mirrors[school];

        apps.forEach(function (app) {
            app.mirrors = results ? results[app.download_url] : [];
        });

        return apps;
    };

    var update = function () {

        console.log('school update start');
        console.log('mirrors:' + JSON.stringify(mirrors));
        apps.forEach(function (app) {
            options = {
                host: config.dl.host,
                port: config.dl.port,
                path: app.download_url,
                method: 'HEAD'
            };
//            console.log(JSON.stringify(options));
            _.map(mirrors, function (value) {
                value[app.download_url] = [];
            });


            var req = http.request(options, function (response) {

                response.setEncoding('utf8');
                var source = response.headers;
//                console.log(JSON.stringify(source));
                onError(response);

                School.find(function (err, results) {
                    if (err) {
                        console.log('mongoose find error:' + JSON.stringify(err));
                        return;
                    }
                    results.forEach(function (school) {
//                        console.log(JSON.stringify(school) + JSON.stringify(app));
                        if (typeof mirrors[school.name] == 'undefined') {
                            mirrors[school.name] = {};
                        }
                        var options = {
                            host: school.host,
                            port: school.port
                        };
                        options.path = app.download_url;
                        options.method = 'HEAD';
//                        console.log(JSON.stringify(options));
                        var req = http.request(options, function (res) {
                            res.setEncoding('utf8');
                            res.on('data', function() { /* do nothing */ });
//                            console.log('headers: ', res.headers);
                            var mirror = res.headers;
//                            console.log('mirror:' + JSON.stringify(mirror));
//                            console.log('source:' + JSON.stringify(source));
                            if (typeof source['last-modified'] != 'undefined' && source['last-modified']
                                == mirror['last-modified'] && source['content-length'] == mirror['content-length']) {
//                                if(typeof mirrors[school.name][app.download_url]){
                                mirrors[school.name][app.download_url] = [];
//                                }
                                mirrors[school.name][app.download_url].push('http://' + school.lhost + ':' + school.lport + app.download_url);
                            }

                            onError(res);
                        });

                        onError(req);
                        req.end();
                    });

                });
            });
            onError(req);
            req.end();
        });
    };

    update();
    schedule.scheduleJob('30 * * * *', update);

    return {
        all: all,
        query: query
    }
}
