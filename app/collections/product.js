define(function (require) {
    var Super = require('./base'),
        Model = require('../models/product');

    var Collection = Super.extend({
        model: Model
    });
    
    Collection.prototype.comparator = function (model) {
            return (model.name || '').toLowerCase();
    };

    return Collection;
});