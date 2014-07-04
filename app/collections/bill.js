define(function(require) {
    var Super = require('./base'),
        Model = require('../models/bill');

    var Collection = Super.extend({
        model: Model,
        url  : '/rest/bills'
    });

    Collection.prototype.comparator = function(model) {
        return -(model.dateCreated);
    };

    return Collection;
});