var db = require('../db'),
    Model = require('../models/workflow-item-user-role');

var Collection = db.Collection.extend({
    model: Model
});

module.exports = Collection;
