var db = require('../db'),
    _ = require('underscore'),
    _s = require('underscore.string');

var Model = db.Model.extend({
                                tableName: 'Base'
                            });


//Model.prototype.parse = function (attrs) {
//    console.log('called');
//    return _.reduce(attrs, function (memo, val, key) {
//        memo[_.str.camelize(key)] = val;
//        return memo;
//    }, {});
//};


module.exports = Model;
