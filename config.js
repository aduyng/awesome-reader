var path = require('path'),
    url = require('url'),
    rootPath = path.normalize(__dirname + '/..'),
    pkg = require('./package.json'),
    env = process.env.NODE_ENV || 'development';


module.exports = {
    development: {
        db: {
            client: 'pg',
            connection: process.env.DATABASE_URL || 'postgres://xudapfydkuhypy:dJH5wfpn8RKmo2pQNErWbNr-YH@ec2-50-16-201-126.compute-1.amazonaws.com:5432/d5hg1nbrvhej3t?ssl=true',
            debug: true
        },
        redis: {
            url: process.env.REDISTOGO_URL || 'redis://redistogo:1bad3ce2e9a04570990325bad31aea4a@grideye.redistogo.com:10234'
        },
        session: {
            secret: "RZm3Fc5OPUUK9LrHGzq03WY2uTon9MK1rSJVEXcOM7vGN9o9v6uQl3KoDr14Uax"
        },
        app: {
            name: pkg.name,
            version: pkg.version,
            refreshFeedInterval: 60,
            refreshTodoInterval: 60,
            port: process.env.PORT || 5000
        }
    },

    production: {
        db: {
            client: 'pg',
            connection: process.env.DATABASE_URL || 'postgres://xudapfydkuhypy:dJH5wfpn8RKmo2pQNErWbNr-YH@ec2-50-16-201-126.compute-1.amazonaws.com:5432/d5hg1nbrvhej3t?ssl=true',
            debug: false
        },
        redis: {
            url: process.env.REDISTOGO_URL || 'redis://redistogo:1bad3ce2e9a04570990325bad31aea4a@grideye.redistogo.com:10234'
        },
        session: {
            secret: "XNapHtFGNXYfvaB87KNQZnw8xBcit3wIFWe64oklG2pKUfrgbgYdn2B5efFx"
        },
        app: {
            name: pkg.name,
            version: pkg.version,
            refreshFeedInterval: 60,
            refreshTodoInterval: 60,
            port: process.env.PORT || 80
        }
    }
};