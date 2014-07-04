define(function (require) {
    var Super = require('./base'),
        Model = require('../models/role');

    var Collection = Super.extend({
        model: Model,
        url: '/rest/roles'
    });

    return Collection;
});