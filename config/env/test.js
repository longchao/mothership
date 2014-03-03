'use strict';

var host = 'localhost',
    database = 'exercise-test';

module.exports = {
    host: host,
    database: database,
    db: "mongodb://" + host + "/" + database,
    port: 9461,
    app: {
        name: "MEAN - A Modern Stack - Test"
    },
    api_key: "339c926e7e417f3bc6f2c986d9ac163a",
    token: "30c340455d48ef0a86f0de60dd01a4bb",
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