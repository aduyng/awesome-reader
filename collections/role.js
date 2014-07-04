var db = require('../db'),
    Model = require('../models/role');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
