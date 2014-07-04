define(function (require) {
    var Super = require('./base'),
        Model = require('../models/payment-category');

    var Collection = Super.extend({
        model: Model
    });

    return Collection;
});