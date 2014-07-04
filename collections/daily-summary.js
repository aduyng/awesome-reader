var db = require('../db'),
    Model = require('../models/daily-summary');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
