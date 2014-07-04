var db = require('../db'),
    Model = require('../models/task-payment');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
