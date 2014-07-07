/**
 * Module dependencies.
 */
var http = require('http'),
    path = require('path'),
    express = require('express'),
    exphbs = require('express3-handlebars'),
    RedisStore = require('connect-redis')(express),
    env = process.env.NODE_ENV || 'development',
    config = require('./config')[env],
    db = require('./db'),
    moment = require('moment'),
    app = express(),
    pkg = require('./package.json'),
    load = require('express-load'),
    colors = require('colors'),
    Account = require('./models/account'),
    everyauth = require('everyauth');

everyauth.everymodule.findUserById( function (userId, callback) {
    console.log('userId', userId);
    
  return Account.forge({id: userId})
    .fetch()
    .then(function(doc){
        if( !doc ){
            callback('User not found!', undefined);
            return;
        }
        callback(undefined, doc);
    });
});

everyauth.everymodule.moduleErrback( function (err) {
  console.log('ERROR', err);
});

everyauth.google.appId(config.google.clientId)
    .appSecret(config.google.clientSecret)
    .scope('https://www.googleapis.com/auth/userinfo.profile')
    .findOrCreateUser(function(sess, accessToken, extra, googleUser) {
        googleUser.refreshToken = extra.refresh_token;
        googleUser.expiresIn = extra.expires_in;
        return Account.forge()
            .query(function(qb){
                qb.where('service', 'google');
                qb.where('serviceUid', googleUser.id );
            })
            .fetch()
            .then(function(doc){
                if( !doc ){
                    return Account.forge({
                        service: 'google',
                        serviceUid: googleUser.id,
                        extras: JSON.stringify(googleUser)
                    })
                    .save();
                }
                return doc;
            });
}).redirectPath('/');


//app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());


app.engine('hbs', exphbs({
    defaultLayout: false,
    extname: '.hbs'
}));
app.set('view engine', 'hbs');

app.use(express.session({
    secret: config.session.secret,
    store: new RedisStore(config.redis)
}));
app.use(express.compress());

app.use(everyauth.middleware(app));

app.use(app.router);

app.use(express.static(path.join(__dirname, '/app')));

app.get('/', function(req, res) {
    var session = {
        userId: 0
    };    
                
    //TODO: will need to fix the auth when accept other auth service
    if( req.session.auth  && req.session.auth.loggedIn && req.session.auth.google ){
        return Account.forge()
            .query(function(qb){
                qb.where('service', 'google');
                qb.where('serviceUid', req.session.auth.google.user.id );
            })
            .fetch()
            .then(function(doc){
                session.userId = doc.id;
                
                res.render('home', {
                    path: 'dist/' + pkg.version,
                    pkg: pkg,
                    config: config,
                    session: session
                });
            });
    }

    res.render('home', {
        path: 'dist/' + pkg.version,
        pkg: pkg,
        config: config,
        session: session
    });
});

//load the current user
app.all('*', function(req, res, next){
    if( req.session && !req.user && req.session.auth  && req.session.auth.loggedIn && req.session.auth.google ){
        return Account.forge()
            .query(function(qb){
                qb.where('service', 'google');
                qb.where('serviceUid', req.session.auth.google.user.id );
            })
            .fetch()
            .then(function(doc){
                req.user = doc;
                next();
            });
    }
    next();
});

load('controllers').then('routes').into(app);

var port = Number(config.port || process.env.PORT || 5000);
var host = config.host || process.env.IP;

var server = app.listen(port, host, function() {
    console.log('Listening on port %s:%d', host, port);
});
