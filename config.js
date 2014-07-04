var path = require('path'),
    url = require('url'),
    rootPath = path.normalize(__dirname + '/..'),
    pkg = require('./package.json'),
    env = process.env.NODE_ENV || 'development';


module.exports = {
    development: {
        port: process.env.PORT,
        host: process.env.IP,
        db: {
            client: 'pg',
            connection: process.env.DATABASE_URL || 'postgres://fxvceqqysemlwc:rnUY32jriRy6CpN7cQqA8--GW-@ec2-54-204-24-202.compute-1.amazonaws.com:5432/dchcac64ft1r0r?ssl=true',
            debug: true
        },
        redis: {
            url: process.env.REDISTOGO_URL || 'redis://redistogo:07ee82ef2f5052d6ac9e01500ea935d7@grouper.redistogo.com:10049'
        },
        session: {
            secret: "rzpbNQW8TYf48cMr5hEnR34g"
        },
        google: {
            clientId: '814955543459-fvkgsu4vg8arpn5bf0q4k1brs3tat5id.apps.googleusercontent.com',
            clientSecret: 'yN9t4cwfuHh8ZH0sXQ6pYyel'
        }
    }
};