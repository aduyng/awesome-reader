var db = require('../db'),
    Role = require('../models/role'),
    Model = require('../models/product-category'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function(req, res, next) {
    return Model.forge({id:req.params.id, storeId: req.session.storeId}).fetch()
    .then(function(doc) {
        res.send(doc.pick('id', 'name'));
    });

};


exports.post = function(req, res, next) {
    return Model.forge()
    .save(_.extend(_.pick(req.body, 'name'), {storeId: req.session.storeId}))
    .then(function(doc) {
        res.send(doc.pick('id', 'name'));
    });

};

exports.put = function(req, res, next) {
    return Model.forge({id: req.params.id, storeId: req.session.storeId})
    .save(_.pick(req.body, 'name'), {patch: true})
    .then(function(doc) {
        res.send(doc.pick('id', 'name'));
    });
};

exports.delete = function(req, res, next) {
    return Model.forge({id: req.params.id, storeId: req.session.storeId})
    .destroy()
    .then(function(doc) {
        res.send(doc);
    });
};