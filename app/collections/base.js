define(function (require) {
    var Super = Backbone.Collection,
        Model = require('../models/base'),
        Collection = Super.extend({
                                      model: Model
                                  });


    return Collection;
});