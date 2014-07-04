var db = require('../db'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function (req, res, next) {
    var userId = req.query.userId;
    if( !userId ){
        res.send(400, 'userId must be provided!');
        return;
    }
    
    
    
    res.send(200, []);
};