var db = require('../db'),
    _ = require('underscore'),
    _s = require('underscore.string');

var Model = db.Model.extend({
                                tableName: 'Base'
                            });


module.exports = Model;
