var db = require('../db'),
    Model = require('../models/feed');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
