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
    colors = require('colors');




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

app.use(app.router);
app.use(function(err, req, res, next) {
    console.error(err);
    switch (err.name) {
    case 'AppError':
        res.send(err.code, {
            message: err.message,
            data: err.data
        });
        break;
    default:
        res.send(500, 'Something broke!');
        break;
    }
});

app.use(express.static(path.join(__dirname, '/app')));
app.all('*', function(req, res, next){
    if( req.headers['x-version']  && req.headers['x-version'] != pkg.version ){
        res.send(426);
        return;
    }
    if( !req.body ){
        req.body = {};
    }
   req.body.now = req.headers['x-now'] || moment().unix();
   next();
});

app.get('/', function(req, res) {
    var session = {
        storeId: req.session.storeId || 0,
        userId: req.session.userId || 0,
        roleId: req.session.roleId || 0
    };

    res.render('home', {
        path: 'dist/' + pkg.version,
        pkg: pkg,
        config: config,
        session: session
    });
});


load('controllers').then('routes').into(app);




var port = Number(process.env.PORT || config.app.port || 5000);
var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});
