var db = require('../db'),
    Model = require('../models/bill-status');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
