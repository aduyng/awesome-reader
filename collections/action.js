var db = require('../db'),
    Model = require('../models/action');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
