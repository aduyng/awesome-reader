define(function (require) {
    var Super = require('./base'),
        Model = require('../models/action');

    var Collection = Super.extend({
        model: Model
    });

    return Collection;
});