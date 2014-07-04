var db = require('../db'),
    Model = require('./task-assignment-method');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
