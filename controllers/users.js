var db = require('../db'),
    Role = require('../models/role'),
    UserCollection = require('../collections/user'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function (req, res, next) {
    //fetch all users belong to the current store
    var query = UserCollection
        .forge()
        .query()
        .join('StoreUserRole', 'StoreUserRole.userId', '=', 'User.id');
        
    if (req.session.roleId == Role.OWNER) {
        query.column('User.id', 'User.name', 'User.email', 'User.phone', 'User.ssn', 'User.address',
                     'User.ownerId', 'StoreUserRole.commissionRatio', 'StoreUserRole.cashRatio', 'StoreUserRole.isActive',
                     'StoreUserRole.salaryWarrantedAmount', 'StoreUserRole.roleId'
        );
    } else {
        query.column('User.id', 'User.name', 'User.email', 'User.phone', 'User.ownerId', 'StoreUserRole.roleId');
    }
    
    query.where('User.isActive', true)
        .where('StoreUserRole.storeId', req.session.storeId);
    if (req.session.roleId == Role.TECHNICIAN) {
        query.where('StoreUserRole.isActive', true);
    }
    query.select()
        .then(function (docs) {
                  res.send(docs);
              });

};
