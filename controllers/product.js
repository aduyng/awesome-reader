var Model = require('../models/product'),
    _ = require('underscore'),
    _s = require('underscore.string');


exports.get = function(req, res, next) {
    
    return Model
        .forge()
        .query(function(qb){
            qb.join('ProductCategory', 'ProductCategory.id', '=', 'Product.categoryId');
            qb.where('ProductCategory.storeId', req.session.storeId);
            qb.where('Product.id', req.params.id);
        })
    .fetch()
    .then(function(doc) {
        res.send(doc.pick('id', 'name', 'price', 'isActive', 'categoryId'));
    });

};


exports.post = function(req, res, next) {
    return Model.forge()
    .save(_.extend(_.pick(req.body, 'name', 'price', 'isActive', 'categoryId')))
    .then(function(doc) {
        res.send(doc.pick('id','name', 'price', 'isActive', 'categoryId'));
    });

};

exports.put = function(req, res, next) {
    return Model.forge({id: req.params.id})
    .save(_.pick(req.body, 'name', 'price', 'isActive'), {patch: true})
    .then(function(doc) {
        res.send(doc.pick('id', 'name', 'price', 'isActive', 'categoryId'));
    });
};

exports.delete = function(req, res, next) {
    return Model.forge({id: req.params.id, storeId: req.session.storeId})
    .destroy()
    .then(function(doc) {
        res.send(doc);
    });
};