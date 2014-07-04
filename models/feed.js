var Super = require('./base'),
    _ = require('underscore');

var Model = Super.extend({
                             tableName: 'Feed'
                         });

//
//Object.defineProperty(Model.prototype, 'roleId', {
//    get: function () {
//        var v = this.get('roleId');
//        if (_.isNumber(v)) {
//            v = parseInt(v, 10);
//            this.roleId = v;
//        }
//        return v;
//    },
//    set: function (val) {
//        if (!_.isNumber(val)) {
//            val = parseInt(val, 10);
//        }
//        this.set('roleId', val);
//    }
//});

Model.prototype.parse = function (attrs) {
    return _.reduce(attrs, function (memo, val, key) {
        switch (key) {
            case 'roleId':
            case 'dateCreated':
            case 'itemId':
                memo[key] = parseInt(val, 10);
                break;
            default:
                memo[key] = val;
        }
        return memo;
    }, {});
};

module.exports = Model;