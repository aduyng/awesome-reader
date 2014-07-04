var db = require('../db'),
    Role = require('../models/role'),
    Workflow = require('../models/workflow'),
    Collection = require('../collections/ticket'),
    UserCollection = require('../collections/user'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function(req, res, next) {
    var tickets;
    //fetch all users belong to the current store
    Collection.forge().query(function(qb) {
        if (req.session.roleId == Role.TECHNICIAN) {
            qb.where('technicianId', req.session.userId);
        }
        else if (req.session.roleId == Role.OWNER) {
            if (req.query.technicianId) {
                qb.where('technicianId', req.query.technicianId);
            }
        }

        qb.where('storeId', req.session.storeId);
        qb.orderBy('dateCreated', 'desc');

        if (req.query.start) {
            qb.where('dateCreated', '>=', req.query.start);
        }
        if (req.query.end) {
            qb.where('dateCreated', '<', req.query.end);
        }

        qb.join('WorkflowItem', 'WorkflowItem.itemId', '=', 'Ticket.id');
        qb.where('WorkflowItem.workflowId', Workflow.TICKET);
        qb.column('WorkflowItem.stateId');

        if (req.query.stateIds) {

            qb.whereIn('WorkflowItem.stateId', req.query.stateIds);
        }

    }.bind(this)).fetch().then(function(docs) {
        tickets = docs;
        if (tickets && tickets.length > 0) {
            return UserCollection.forge().query(function(qb) {
                qb.whereIn('id', _.uniq(docs.pluck('technicianId')));
            }).fetch();
        }
    }.bind(this)).then(function(users) {
        if (tickets && tickets.length > 0) {
            var columns;
            if (req.session.roleId == Role.OWNER) {
                columns = ['id', 'dateCreated', 'nbOfTasks', 'amount', 'turnIncreasedBy', 'stateId', 'billId', 'technicianId'];
            }
            else {
                columns = ['id', 'dateCreated', 'nbOfTasks', 'amount', 'stateId', 'billId', 'technicianId'];
            }
            return res.send(tickets.map(function(ticket) {
                return _.extend(ticket.pick(columns), {
                    technician: users.get(ticket.get('technicianId')).pick('id', 'name')
                });
            }));
        }
        res.send(200, []);
    });
    

};
