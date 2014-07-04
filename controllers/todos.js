var db = require('../db'),
    Role = require('../models/role'),
    Todo = require('../models/todo'),
    TodoCollection = require('../collections/todo'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.count = function (req, res, next) {
    if (!req.session.userId) {
        res.send(404);
        return;
    }

    Todo
        .forge()
        .query()
        .where('userId', req.session.userId)
        .count('id')
        .limit(1)
        .then(function (rows) {
                  if (!rows || rows.length === 0) {
                      res.send(200, {count: 0});
                  }
                  res.send(200, {count: parseInt(rows[0].count, 10)});
              });

};


exports.get = function (req, res, next) {
    if (!req.session.userId) {
        res.send(404);
        return;
    }
    var page = parseInt(req.query.page, 10) || 0;
    var perPage = parseInt(req.query.perPage, 10) || 10;


    TodoCollection
        .forge()
        .query(function (qb) {
                   qb.where('userId', req.session.userId)
                       .orderBy('dateCreated', 'desc')
                       .limit(perPage)
                       .offset(page * perPage);
               })
        .fetch()
        .then(function (rows) {
                  res.send(200, rows.map(function (row) {
                      return row.pick('id', 'dateCreated', 'title', 'description', 'url', 'itemId', 'roleId');
                  }));
              });
};