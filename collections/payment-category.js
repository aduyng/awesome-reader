var db = require('../db'),
    Model = require('../models/payment-category');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
