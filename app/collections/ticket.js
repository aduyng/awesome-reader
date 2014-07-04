define(function(require) {
    var Super = require('./base'),
        Model = require('../models/ticket');

    var Collection = Super.extend({
        model: Model,
        url  : '/rest/tickets'
    });

    Collection.prototype.comparator = function(model) {
        return -(model.dateCreated);
    };

    return Collection;
});