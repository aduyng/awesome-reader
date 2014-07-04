/*global _*/
define(function(require) {
    var Super = require('./base'),
        Model = require('../models/category');

    var Collection = Super.extend({
        model: Model,
        url: '/rest/categories',
        comparator: 'name',
        parse: function(resp, options) {
            if( resp ){
                return _.map(resp, function(cat){
                    return _.extend(cat, {products: _.sortBy(cat.products, function(product){
                        return product.name;
                    })});
                })
            }
            return resp;
        }
    });

    return Collection;
});