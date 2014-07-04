var db = require('../db'),
    Model = require('../models/product-category');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
