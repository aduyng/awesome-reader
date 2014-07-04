define(function (require) {
    var Super = require('./base'),
        Model = require('../models/ticket-status');

    var Collection = Super.extend({
        model: Model
    });

    return Collection;
});