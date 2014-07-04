var db = require('../db'),
    UserCollection = require('../collections/user'),
    User = require('../models/user'),
    Product = require('../models/product'),
    StoreUserRoleCollection = require('../collections/store-user-role'),
    StoreUserRole = require('../models/store-user-role'),
    Store = require('../models/store'),
    Task = require('../models/task'),
    Ticket = require('../models/ticket'),
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');

exports.income = function (req, res, next) {
    var startDate = moment(req.params.startDate, 'MM-DD-YYYY'),
        endDate = moment(req.params.endDate, 'MM-DD-YYYY');


    //find out number of
    StoreUserRoleCollection
        .forge()
        .query()
        .join(Task.prototype.tableName, [Task.prototype.tableName, 'assigneeId'].join('.'), '=', [StoreUserRole.prototype.tableName, 'userId'].join('.'))
        .join(Ticket.prototype.tableName, [Task.prototype.tableName, 'ticketId'].join('.'), '=', [Ticket.prototype.tableName, 'id'].join('.'))
        .where([StoreUserRole.prototype.tableName, 'storeId'].join('.'), '=', req.session.storeId)
        .join(User.prototype.tableName, [User.prototype.tableName, 'id'].join('.'), '=', [StoreUserRole.prototype.tableName, 'userId'].join('.'))
        .where([User.prototype.tableName, 'isActive'].join('.'), '=', 1)
        .whereRaw(['DATE(', [Ticket.prototype.tableName, 'dateCreated'].join('.'), ') >= ', _s.quote(startDate.format('YYYY-MM-DD'))].join(''))
        .whereRaw(['DATE(', [Ticket.prototype.tableName, 'dateCreated'].join('.'), ') <= ', _s.quote(endDate.format('YYYY-MM-DD'))].join(''))
        .groupBy([User.prototype.tableName, 'id'].join('.'), [User.prototype.tableName, 'name'].join('.'), [StoreUserRole.prototype.tableName, 'commissionRatio'].join('.'), [StoreUserRole.prototype.tableName, 'cashRatio'].join('.'))
        .orderBy([User.prototype.tableName, 'name'].join('.'))
        .select(db.knex.raw([
                [User.prototype.tableName, 'id'].join('.'),
                [User.prototype.tableName, 'name'].join('.'),
                [StoreUserRole.prototype.tableName, 'commissionRatio'].join('.'),
                [StoreUserRole.prototype.tableName, 'cashRatio'].join('.'),
                ['COUNT(', [Task.prototype.tableName, 'id'].join('.'), ') as nbTasks'].join(''),
                ['SUM(', [Task.prototype.tableName, 'price'].join('.'), ') as grossIncome'].join(''),
                ['SUM(', [Task.prototype.tableName, 'tip'].join('.'), ') as tip'].join('')
            ].join(',')
        )).then(function (stats) {
            res.send(200, stats);
        });

};