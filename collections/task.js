var db = require('../db'),
    Model = require('../models/task');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
