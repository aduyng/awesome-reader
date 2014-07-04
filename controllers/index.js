var db = require('../db'),
    Ticket = require('../models/ticket'),
    Task = require('../models/task'),
    StoreUserRole = require('../models/store-user-role'),
    Promise = require('bluebird'),
    TicketStatusCollection = require('../collections/ticket-status'),
    PaymentCategoryCollection = require('../collections/payment-category'),
    BillStatusCollection = require('../collections/bill-status'),
    RoleCollection = require('../collections/role'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.pageIndex = function (req, res, next) {
    res.send(200);
};

exports.pageSignOut = function (req, res, next) {
    res.send(200);
};

exports.pageSignIn = function (req, res, next) {
    res.send(200);
};

exports.config = function (req, res, next) {
    var data = {
        app: {
            name               : config.app.name,
            version            : config.app.version,
            refreshFeedInterval: config.app.refreshFeedInterval,
            refreshTodoInterval: config.app.refreshTodoInterval
        }
    };
    res.send(200, data);

};
