var db = require('../db'),
    Model = require('../models/workflow-method');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
