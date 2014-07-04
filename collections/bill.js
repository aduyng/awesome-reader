var db = require('../db'),
    Model = require('../models/bill');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
