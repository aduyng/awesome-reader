var db = require('../db'),
    Model = require('../models/base'),
    _ = require('underscore'),
    _s = require('underscore.string');

var Collection = db.Collection.extend({
                                          model: Model
                                      });


//Model.prototype.parse = function (attrs) {
//    return _.reduce(attrs, function (memo, val, key) {
//        memo[_s.camelize(key)] = val;
//        return memo;
//    }, {});
//};


module.exports = Collection;
