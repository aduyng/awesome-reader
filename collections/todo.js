var db = require('../db'),
    Model = require('../models/todo');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
