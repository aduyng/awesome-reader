var db = require('../db'),
    _ = require('underscore'),
    _s = require('underscore.string');

var Model = db.Model.extend({
    tableName: 'Account'
});


module.exports = Model;
