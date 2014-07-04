var db = require('../db'),
    Store = require('../models/store'),
    Role = require('../models/role'),    
    Workflow = require('../models/workflow'),
    TicketStatus = require('../models/ticket-status'),
    BillStatus = require('../models/bill-status'),
    UserCollection = require('../collections/user'),
    StoreUserRoleCollection = require('../collections/store-user-role'),
    TicketCollection = require('../collections/ticket'),
    Ticket = require('../models/ticket'),
    BillCollection = require('../collections/bill'),
    Bill = require('../models/bill'),
    BillPaymentCollection = require('../collections/bill-payment'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env],
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function(req, res, next) {
    
    return Store.forge({
        id: req.params.id
    }).fetch().then(function(doc) {
        res.send(doc.pick(
            'id', 
            'name', 
            'alias', 
            'email', 
            'phone', 
            'address', 
            'defaultCommissionRatio', 
            'turnThresholdAmount', 
            'defaultTipDeductionRatio', 
            'defaultCashRatio', 
            'defaultSalaryWarrantedAmount', 
            'isTechnicianManagesTasksAllowed'));
    });
    
};

exports.put = function(req, res, next) {
    return Store.forge({id: req.params.id})
    .save(_.pick(req.body, 'name', 
            'alias', 
            'email', 
            'phone', 
            'address', 
            'defaultCommissionRatio', 
            'turnThresholdAmount', 
            'defaultTipDeductionRatio', 
            'defaultCashRatio', 
            'defaultSalaryWarrantedAmount', 
            'isTechnicianManagesTasksAllowed'), {patch: true})
    .then(function(doc) {
        res.send(doc.pick('id', 'name', 
            'alias', 
            'email', 
            'phone', 
            'address', 
            'defaultCommissionRatio', 
            'turnThresholdAmount', 
            'defaultTipDeductionRatio', 
            'defaultCashRatio', 
            'defaultSalaryWarrantedAmount', 
            'isTechnicianManagesTasksAllowed'));
    });
};

exports.incomeOfUsers = function (req, res, next) {
    //make sure that only owner can request for this info
    if (req.session.roleId != Role.OWNER) {
        res.send(403);
        return;
    }


    var start = req.query.start || moment.unix(req.query.now).startOf('day').unix(),
        end = req.query.end || moment.unix(req.query.now).endOf('day').unix();


    Store.incomeOfUsers(req.session.storeId, start, end, req.query.ticketId)
        .then(function (docs) {
                  res.send(docs);
              });

};

exports.technicians = function (req, res, next) {
    var surs = null;
    if (req.session.roleId != Role.OWNER) {
        res.send(403);
        return;
    }
    
    return StoreUserRoleCollection.forge()
        .query(function(qb){
            qb.where('storeId', req.session.storeId);
            qb.where('isActive', true);
        })
        .fetch()
        .then(function(docs){
            surs = docs; 
            if( surs && surs.length > 0){
                return UserCollection.forge()
                    .query(function(qb){
                        qb.whereIn('id', _.uniq(surs.pluck('userId')));
                    })
                    .fetch();
            }
        }.bind(this))
        .then(function(docs){
                res.send(surs.map(function(sur){
                    return _.extend(sur.toJSON(), docs.get(sur.userId).pick('id', 'name'));
                }));
        }.bind(this))
};

exports.summaryOfBills = function (req, res, next) {
        //make sure that only owner can request for this info
    if (req.session.roleId != Role.OWNER) {
        res.send(403);
        return;
    }

    var start = req.query.start || moment.unix(req.query.now).startOf('day').unix(),
        end =  req.query.end || moment.unix(req.query.now).endOf('day').unix();
    
    return BillCollection.forge()
        .query()
        .column(
            db.knex.raw('COUNT("Bill"."id") as "nbOfBills"'),
            db.knex.raw('SUM("Bill"."nbOfTasks") as "nbOfTasks"'),
            db.knex.raw('SUM("Bill"."nbOfTickets") as "nbOfTickets"'),
            db.knex.raw('SUM("Bill"."amount") as "total"'))
        .join('WorkflowItem', 'WorkflowItem.itemId', '=', 'Bill.id')
        .where('WorkflowItem.stateId', BillStatus.PAID)
        .where('Bill.storeId', req.session.storeId)
        .where('WorkflowItem.workflowId', Workflow.BILL)
        .whereBetween('dateCreated', [start, end])
        .select()
        .then(function(docs){
            var stat;
            if( docs && docs.length > 0){
                stat = docs[0];
            }
            res.send(stat);
        });
};

exports.summaryOfPayments = function (req, res, next) {
        //make sure that only owner can request for this info
    if (req.session.roleId != Role.OWNER) {
        res.send(403);
        return;
    }

    var start = req.query.start || moment.unix(req.query.now).startOf('day').unix(),
        end =  req.query.end || moment.unix(req.query.now).endOf('day').unix();
    
    return BillPaymentCollection.forge()
        .query()
        .column('paymentCategoryId', 
            db.knex.raw('SUM("BillPayment"."amount") as "total"'))
        .join('Bill', 'Bill.id', '=', 'BillPayment.billId')
        .join('WorkflowItem', 'WorkflowItem.itemId', '=', 'Bill.id')
        .where('WorkflowItem.stateId', BillStatus.PAID)
        .where('Bill.storeId', req.session.storeId)
        .where('WorkflowItem.workflowId', Workflow.BILL)
        .whereBetween('dateCreated', [start, end])
        .groupBy('paymentCategoryId')
        .select()
        .then(function(docs){
            res.send(docs);
        });
};

exports.summaryOfIncome = function (req, res, next) {
    //make sure that only owner can request for this info
    if (req.session.roleId != Role.OWNER) {
        res.send(403);
        return;
    }

    var start = req.query.start || moment.unix(req.query.now).startOf('day').unix(),
        end =  req.query.end || moment.unix(req.query.now).endOf('day').unix();

    return TicketCollection.forge()
        .query()
        .column('technicianId', 
            db.knex.raw('COUNT("Ticket"."id") as "nbOfTickets"'), 
            db.knex.raw('SUM("turnIncreasedBy") as "turns"'), 
            db.knex.raw('SUM("amount") as "gross"'), 
            db.knex.raw('SUM("tip") as "tipGross"'),
            db.knex.raw('SUM("tip"*(100-"tipDivisionRatio")/100) as "tipNet"'),
            db.knex.raw('SUM("amount"*"commissionRatio"/100) as "net"'))
        .groupBy('technicianId')
        .whereBetween('dateCreated', [start, end])
        .where('storeId', req.session.storeId)
        .join('WorkflowItem', 'WorkflowItem.itemId', '=', 'Ticket.id')
        .where('WorkflowItem.workflowId', Workflow.TICKET)
        .where('WorkflowItem.stateId', TicketStatus.PAID)
        .select()
        .then(function(docs){
            res.send(docs);
        });
};

exports.summaryOfTechnician = function (req, res, next) {
    //make sure that only owner can request for this info
    if (req.session.roleId != Role.TECHNICIAN) {
        res.send(403);
        return;
    }

    
    var start = req.query.start || moment.unix(req.query.now).startOf('day').unix(),
        end =  req.query.end || moment.unix(req.query.now).endOf('day').unix();

    return Ticket.forge()
        .query()
        .column(
            db.knex.raw('COUNT("Ticket"."id") as "nbOfTickets"'), 
            db.knex.raw('SUM("turnIncreasedBy") as "turns"'), 
            db.knex.raw('SUM("amount") as "gross"'),
            db.knex.raw('SUM("tip") as "tipGross"'),
            db.knex.raw('SUM("tip"*(100-"tipDivisionRatio")/100) as "tipNet"'),
            db.knex.raw('SUM("amount"*("commissionRatio")/100) as "net"'))
        .whereBetween('dateCreated', [start, end])
        .where('storeId', req.session.storeId)
        .where('technicianId', req.session.userId)
        .join('WorkflowItem', 'WorkflowItem.itemId', '=', 'Ticket.id')
        .where('WorkflowItem.workflowId', Workflow.TICKET)
        .where('WorkflowItem.stateId', TicketStatus.PAID)
        .select()
        .then(function(docs){
            res.send(docs[0]);
        });
};

