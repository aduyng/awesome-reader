var db = require('../db'),
    Model = require('../models/workflow-group');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
