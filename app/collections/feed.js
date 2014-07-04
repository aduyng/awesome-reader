define(function(require) {
    var Super = require('./base'),
        Model = require('../models/feed'),
        Collection = Super.extend({
            model: Model,
            url: '/feeds'
        });


    return Collection;
});