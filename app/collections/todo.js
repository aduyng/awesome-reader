define(function (require) {
    var Super = require('./base'),
        Model = require('../models/todo');

    var Collection = Super.extend({
                                      model: Model,
                                      url  : '/rest/todos'

                                  });

    return Collection;
});