define(function (require) {
    var Super = require('./base'),
        Model = require('../models/bill-payment');

    var Collection = Super.extend({
        model: Model
    });

    return Collection;
});