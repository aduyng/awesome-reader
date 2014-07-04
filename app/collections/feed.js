define(function (require) {
    var Super = require('./base'),
        Model = require('../models/feed');

    var Collection = Super.extend({
                                      model: Model,
                                      url  : '/rest/feeds'

                                  });

    Collection.prototype.comparator = function (model) {
        return -model.dateCreated;
    };


    return Collection;
});