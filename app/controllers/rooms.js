/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Room = mongoose.model('Room'),
    App = mongoose.model('WebApp');

/**
 * Create user
 */
exports.create = function (req, res) {
    console.log('req.body:%s', JSON.stringify(req.body));
    var room = new Room(req.body);
    var message = null;

    room.save(function (err, room) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Room already exists';
                    break;
                default:
                    message = 'Please fill all the required fields';
            }
            return res.json(500);
        }
        res.json(room)
    });
};

exports.users = function (req, res) {
    if (req.room) {
        res.json(req.room.users);
    } else {
        res.json(404);
    }
};

exports.exitRoom = function (req, res) {
    if (req.room && req.profile) {
        req.room.exitUser(req.profile, function (err, room) {
            if (err) return res.json(500);
            res.json(room);
        });
    } else {
        return res.json(404);
    }
};

exports.joinRoom = function (req, res) {
    console.log(req.body);

    var cb = function (err, user) {
        if (err) return res.json(404, err);
        if (user) {
            req.room.joinUser(user, function (err, room) {
                if (err) return res.json(500);
                res.json(room);
            });
        } else {
            res.json(404);
        }
    }

    if (!req.room) return res.json(404);
    if (req.body.userName) {
        User.findOne({
            username: req.body.userName
        }).exec(cb);
    } else {
        User.findById(req.body.userId).exec(cb);
    }
};

exports.all = function (req, res) {
    Room.find().exec(function (err, rooms) {
        res.json((err) ? null : rooms);
    });
};
exports.show = function (req, res) {
    res.json(req.room);
};
exports.destroy = function (req, res) {
    if (req.room) {
        req.room.remove(function (err, room) {
            if (err) return res.send(500);
            res.json(room);
        });
    } else {
        res.send(404);
    }
};

/**
 * Find room by id
 */
exports.room = function (req, res, next, id) {
    Room
        .findOne({
            _id: id
        })
        .exec(function (err, room) {
            if (err) return next(err);
            if (!room) return next(new Error('Failed to load Room' + id));
            req.room = room;
            next();
        });
};

exports.apps = function (req, res) {
    if (req.room) {
        res.json(req.room.apps);
    } else {
        res.json(404);
    }
};

exports.removeApp = function (req, res) {
    if (req.room && req.app) {
        App.findAppByAppId(req.app.id, function (err, app) {
            if (err) {
                console.log('Server Error---rooms.removeApp' + JSON.stringify(err));
                return res.json(500, err);
            }

            req.room.removeApp(app, function (err, room) {
                if (err) return res.json(500, err);
                res.json(room);
            });
        });
    } else {
        if (!req.room) {
            console.log('Not Found room...');
        }
        if (!req.app) {
            console.log('Not Found app...');
        }
        return res.json(404);
    }
};

exports.addApp = function (req, res) {
    if (!req.room) return res.json(404);
    App.findAppByAppId(req.body.appId, function (err, app) {
        if (err) return res.json(500, err);
        if (app) {
            req.room.addApp(app, function (err, room) {
                if (err) return res.json(500);
                res.json(room);
            });
        } else {
            res.json(404);
        }
    })
}





























