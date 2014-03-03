'use strict';

var host = 'localhost',
    database = 'exercise-prod';

module.exports = {
    host: host,
    database: database,
    db: "mongodb://" + host + "/" + database,
    port: 80,
    app: {
        name: "MEAN - A Modern Stack - Production"
    },
    api_key: "1291ff9d8ceb337db6a0069d88079474",
    token: "2565f95f1bb387b875e146a94d264c36",
    facebook: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    twitter: {
        clientID: "CONSUMER_KEY",
        clientSecret: "CONSUMER_SECRET",
        callbackURL: "http://localhost:3000/auth/twitter/callback"
    },
    github: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    google: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/google/callback"
    }
}