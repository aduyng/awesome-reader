var db = require('../db'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    FeedCollection = require('../collections/feed'),
    _s = require('underscore.string');



exports.get = function (req, res, next) {
    return FeedCollection.forge()
        .query(function(qb){
            qb.where('userId', req.user.id);
        })
        .fetch()
        .then(function(docs){
            res.send(docs.map(function(doc){
                return doc.toJSON();
            }));
        });
        
};