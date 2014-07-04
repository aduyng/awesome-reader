var db = require('../db'),
    Model = require('../models/store');

var Collection = db.Collection.extend({
    model: Model
});



module.exports = Collection;
