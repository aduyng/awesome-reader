var db = require('../db'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    Feed = require('../models/feed'),
    request = require('request'),
    _s = require('underscore.string');


exports.parseInfo = function(req, res, next) {
    var url = req.query.url;
    if (!url) {
        res.send(400, 'url must be provided!');
        return;
    }



    (function() {
        return new Promise(function(resolve, reject) {
            var options = {
                url: 'https://ajax.googleapis.com/ajax/services/feed/load',
                qs: {
                    v: '1.0',
                    q: url,
                    num: 1
                },
                headers: {
                    Referer: req.headers.referer
                }
            }
            request(options, function(error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(JSON.parse(body));
            });
        });
    })().then(function(resp) {
        res.send({
            name    : resp.responseData.feed.title, 
            iconUrl : resp.responseData.feed.link + '/favicon.ico'
        });
    }).catch(next);

};

exports.post = function(req, res, next){
    return Feed.forge(_.extend(_.pick(req.body, 'iconUrl', 'name', 'url'), {userId: req.user.id}))
        .save()
        .then(function(doc){
            res.send(doc.toJSON());
        });
};

exports.put = function(req, res, next){
    return Feed.forge({id: req.params.id})
        .save(_.pick(req.body, 'iconUrl', 'name', 'url'), {patch: true})
        .then(function(doc){
            res.send(doc.toJSON());
        });
};

exports.delete = function(req, res, next){
    return Feed.forge({id: req.params.id})
        .destroy()
        .then(function(doc){
            res.send(200);
        });
};