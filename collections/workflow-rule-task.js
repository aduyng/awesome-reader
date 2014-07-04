var db = require('../db'),
    Model = require('../models/workflow-rule-task');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
