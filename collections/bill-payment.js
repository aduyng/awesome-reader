var db = require('../db'),
    Model = require('../models/bill-payment');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
