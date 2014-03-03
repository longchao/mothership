'use strict';

var path = require('path'),
    rootPath = path.normalize(__dirname + '/../..');

module.exports = {
    root: rootPath,
    port: process.env.PORT || 3000,
    db: process.env.MONGOHQ_URL,
    mixpanel: {
        host: 'api.mixpanel.com',
        port: '80',
        path: '/import/',
        method: 'POST'
    },
    webapp: {
        base: "/webapp",
        folder: rootPath + '/webapp'
    }
}
