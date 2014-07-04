define(function (require) {
    var Super = require('./base'),
        Model = require('../models/store');

    var Collection = Super.extend({
        model: Model
        
    });

    return Collection;
});