var Super = require('./base'),
    Model = require('../models/feed'),
    _ = require('underscore'),
    _s = require('underscore.string');

var Collection = Super.extend({
    model: Model
});



module.exports = Collection;
