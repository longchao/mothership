'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Auth callback
 */
exports.authCallback = function (req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function (req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

/**
 * Show sign up form
 */
exports.signup = function (req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */
exports.signout = function (req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function (req, res) {
    res.send(req.session);
};

/**
 * Create user
 */
exports.create = function (req, res, next) {
    var user = new User(req.body);
    var message = null;

    user.provider = 'local';
    user.active = false;
    if (user.usergroup != "teacher") {
        user.usergroup = 'student';
    }
//    user.profile.school_name = user.username.substring(0, 2);
//    user.profile.room_name = user.username.substring(2, 6);
//    user.profile.room_uid = user.username.substring(6, 8);
    user.save(function (err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Username already exists';
                    break;
                default:
                    message = 'Please fill all the required fields';
            }
            return res.send(400, {message: message});
        } else {
            return res.redirect("/dispatch");
        }
    });
};

/**
 * Get all users
 */
exports.all = function (req, res) {
    User.find().exec(function (err, users) {
        res.json((err) ? null : users);
    })
}

/**
 * Reset user password
 */
exports.password = function (req, res) {
    var user = req.profile;
    var newPassword = req.body.password;
    console.log("change password user:%s,%s", user, newPassword);
    if (newPassword && newPassword != "") {
        user.password = newPassword;
        user.active = true;
        user.save(function (err) {
            if (err) {
                res.send(500, {message: "update user failed"});
            } else {
                req.logout();
                res.redirect('/webapp/login');
            }
        });
    } else {
        res.send(400, {message: "password cannot be empty"});
    }
};
/**
 * Reset user password
 */
exports.profile = function (req, res) {
    console.log('update profile,%s,%s', req.user, req.body);
    var user = req.user;
    var newProfile = req.body;
    if (newProfile) {
        user.profile = newProfile;
        user.save(function (err) {
            if (err) {
                res.send(500, {message: "update user failed"});
            } else {
                res.send({message: "success"})
            }
        });
    } else {
        res.send(400, {message: "profile cannot be empty"});
    }
};

/**
 * Send User
 */
exports.me = function (req, res) {
    res.jsonp(req.user || null);
};

exports.show = function (req, res) {
    res.jsonp(req.profile);
}

exports.dispatch = function (req, res) {
    if (req.user) {
        if (req.user.usergroup != "teacher") {
            if (req.user.isProfileFullfill()) {
                res.redirect("/webapp/exercise/");
            } else {
                res.redirect("/webapp/me/bootstrap.html")
            }
        } else {
            res.redirect("/webapp/me/index.html");
        }
    } else {
        res.redirect('/');
    }
}

/**
 * Find user by id
 */
exports.user = function (req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function (err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};