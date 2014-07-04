var db = require('../db'),
    Model = require('../models/ticket-status');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
