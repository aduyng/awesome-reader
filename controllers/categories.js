var db = require('../db'),
    Role = require('../models/role'),
    Collection = require('../collections/product-category'),
    ProductCollection = require('../collections/product'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function(req, res, next) {
    return Collection.forge().query(function(qb) {
        qb.where('storeId', req.session.storeId);
    }).fetch().then(function(docs) {
        if (docs && docs.length > 0) {
            if (req.query.products) {
                return ProductCollection.forge().query(function(qb) {
                    qb.whereIn('categoryId', _.uniq(docs.pluck('id')))
                }).fetch().then(function(products) {
                    products.forEach(function(product) {
                        var category = docs.get(product.get('categoryId'));
                        var p = category.get('products') || [];
                        p.push(product);
                        category.set('products', p);
                    });
                    return docs;
                })

            }
        }

        return docs;
    }.bind(this)).then(function(docs) {
        res.send(docs.map(function(doc) {
            return doc.pick('id', 'name', 'products');
        }));
    });

};
