var db = require('../db'),
    Ticket = require('../models/ticket'),
    Task = require('../models/task'),
    Role = require('../models/role'),
    Store = require('../models/store'),
    StoreUserRole = require('../models/store-user-role'),
    StoreUserRoleCollection = require('../collections/store-user-role'),
    ProductCollection = require('../collections/product'),
    
    ActionCollection = require('../collections/action'),
    ProductCategoryCollection = require('../collections/product-category'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function (req, res, next) {
    var resp;

    if (req.session && req.session.userId) {
        Promise.all([
                        Store
                            .forge({id: req.session.storeId})
                            .fetch(),
                        ProductCategoryCollection
                            .forge()
                            .query(function (qb) {
                                       qb.where('storeId', req.session.storeId);
                                   })
                            .fetch({
                                   }),
                        ActionCollection
                            .forge()
                            .fetch()
                    ])
            .spread(function (store, categories, actions) {
                        resp = {
                            store     : store,
                            categories: categories,
                            actions   : actions
                        };
                        return ProductCollection
                            .forge()
                            .query(function (qb) {
                                       qb.whereIn('categoryId', _.uniq(categories.pluck('id')));
                                   })
                            .fetch({
                                   });
                    })
            .then(function (products) {
                      resp.categories = resp.categories.map(function (category) {
                          return _.extend(category.toJSON(), {
                              products: products.filter(function (product) {
                                  return product.categoryId == category.id;
                              })
                          });
                      });
                      delete resp.storeProducts;
                      res.send(resp);
                  });
    }else{
        res.send(200);
    }

};
