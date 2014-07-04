var db = require('../db'),
    Feed = require('../models/feed'),
    Handlebars = require('handlebars'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.put = function (req, res, next) {
    Feed.forge({
                   id    : req.params.id,
                   userId: req.session.userId
               })
        .fetch()
        .then(function (feed) {
                  return  feed.save(_.pick(req.body, 'isRead'), {patch: true});
              })
        .then(function (savedFeed) {
                  res.send(200, savedFeed.pick('id', 'dateCreated', 'title', 'description', 'url', 'itemId', 'roleId', 'isRead'));
              })
        .catch(next);
};

