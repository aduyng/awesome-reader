var db = require('../db'),
    Role = require('../models/role'),
    Workflow = require('../models/workflow'),
    Collection = require('../collections/bill'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function(req, res, next) {

    //fetch all users belong to the current store
    Collection.forge().query(function(qb) {
        qb.where('storeId', req.session.storeId);
        qb.orderBy('dateCreated', 'desc');

        if (req.query.start) {
            qb.where('dateCreated', '>=', req.query.start);
        }
        if (req.query.end) {
            qb.where('dateCreated', '<', req.query.end);
        }

        qb.join('WorkflowItem', 'WorkflowItem.itemId', '=', 'Bill.id');
        qb.where('WorkflowItem.workflowId', Workflow.BILL);
        qb.column('WorkflowItem.stateId');

        if (req.query.stateIds) {
            qb.whereIn('WorkflowItem.stateId', req.query.stateIds);
        }

    }.bind(this)).fetch().then(function(docs) {
        var columns = ['id', 'dateCreated', 'nbOfTasks', 'nbOfTickets', 'amount', 'tip', 'stateId'];
        res.send(docs.map(function(doc) {
            return doc.pick(columns);
        }));
    });

};
