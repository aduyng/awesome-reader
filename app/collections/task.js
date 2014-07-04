define(function (require) {
    var Super = require('./base'),
        Model = require('../models/task');

    var Collection = Super.extend({
        model: Model
    });

    return Collection;
});