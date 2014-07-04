define(function (require) {
    var Super = require('./base'),
        Model = require('../models/bill-status');

    var Collection = Super.extend({
        model: Model
    });

    return Collection;
});