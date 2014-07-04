var db = require('../db'),
    Model = require('../models/workflow-rule-post-task-recipient');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
