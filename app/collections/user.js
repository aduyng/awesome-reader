define(function (require) {
    var Super = require('./base'),
        Model = require('../models/user');

    var Collection = Super.extend({
                                      model  : Model,
                                      url: 'rest/users',
                                      comparator: 'name'
                                  });

    return Collection;
});