var
    _ = require('underscore'),
    _s = require('underscore.string'),
    db = require('../db'),
    Model = require('../models/product'),
    Product = Model;

var Collection = db.Collection.extend({
    model: Model
});



module.exports = Collection;
