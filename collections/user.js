var db = require('../db'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    StoreUserRole = require('../models/store-user-role'),
    Role = require('../models/role'),
    Model = require('../models/user'),
    User = Model;

var Collection = db.Collection.extend({
    model: Model
});
//
//Collection.prototype.fetchAllActiveUsersByStoreId = function (storeId, callback) {
//    this.query(function (qb) {
//        qb.column(_.map(['id', 'name'], function (field) {
//            return [Role.prototype.tableName, '.' , field , ' as role', _s.classify(field)].join('');
//        }));
//        qb.join(StoreUserRole.prototype.tableName, [StoreUserRole.prototype.tableName, 'userId'].join('.'), '=', [User.prototype.tableName, 'id'].join('.'));
//        qb.join(Role.prototype.tableName, [StoreUserRole.prototype.tableName, 'roleId'].join('.'), '=', [Role.prototype.tableName, 'id'].join('.'));
//        qb.where([User.prototype.tableName, 'isActive'].join('.'), 1);
//        qb.where([StoreUserRole.prototype.tableName, 'storeId'].join('.'), storeId);
//    })
//        .fetch()
//        .then(callback);
//};

module.exports = Collection;
