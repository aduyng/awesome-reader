var db = require('../db'),
    Model = require('../models/ticket');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
