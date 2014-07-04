var _ = require('underscore'),
    moment = require('moment'),
    accounting = require('accounting'),
    Super = require('./base'),
    Ticket = require('../ticket'),
    Bill = require('../bill'),
    BillPayment = require('../bill-payment'),
    BillPaymentCollection = require('../../collections/bill-payment'),
    UserCollection = require('../../collections/user'),
    Store = require('../store'),
    WorkflowItemUserRole = require('../workflow-item-user-role'),
    Role = require('../role'),
    User = require('../user'),
    Task = require('../task'),
    Workflow = require('../workflow'),
    Action = require('../action'),
    TicketCollection = require('../../collections/ticket'),
    Promise = require('bluebird'),
    Handlebars = require('handlebars'),
    ProductCollection = require('../../collections/product'),
    StoreUserRole = require('../store-user-role'),
    StoreUserRoleCollection = require('../../collections/store-user-role');

var Model = Super.extend({});


Model.prototype.getItem = function(itemId) {
    if (this.item) {
        return Promise.resolve(this.item);
    }

    if (!this.item) {
        if (!itemId) {
            return Promise.resolve();
        }

        return Bill.forge({
            id: itemId
        }).fetch().then(function(t) {
            this.item = t;
            return Promise.resolve(t);
        }.bind(this));
    }

    return Promise.resolve(this.item);
};

Model.prototype.create = function() {
    return Bill.forge({
        storeId: this.session.storeId,
        nbOfTickets: 0,
        amount: 0,
        dateCreated: this.params.now || moment().unix(),
        nbOfTasks: 0,
        tip: 0
    }).save(null, {
        transacting: this.transaction
    });
};


Model.prototype.initRoles = function() {

};

Model.prototype.view = function() {
    var tickets; 
    var resp = _.extend(this.bill.toJSON(), {
        stateId: this.workflowItem.stateId
    });

    return Promise.resolve().then(function() {
        return Promise.all([TicketCollection.forge().query(function(qb) {
            qb.where('billId', this.bill.id);
        }.bind(this)).fetch(), BillPaymentCollection.forge().query(function(qb){
            qb.where('billId', this.bill.id);
        }.bind(this)).fetch()])
    }.bind(this)).spread(function(t, payments) {
        tickets = t;
        
        resp.payments = payments.toJSON();
        
        if( tickets && tickets.length > 0){
            return UserCollection.forge()
                .query(function(qb){
                    qb.whereIn('id', _.uniq(tickets.pluck('technicianId')));
                })
                .fetch();
        }

    }.bind(this))
    .then(function(technicians){
        if( tickets && tickets.length > 0){
            var columns;
            if (this.session.roleId == Role.OWNER) {
                columns = ['id', 'dateCreated', 'nbOfTasks', 'amount', 'turnIncreasedBy', 'stateId', 'billId', 'technicianId', 'tip'];
            }else{
                columns = ['id', 'dateCreated', 'nbOfTasks', 'amount', 'stateId', 'billId', 'technicianId', 'tip'];
            }
            resp.tickets =  tickets.map(function(ticket) {
                return _.extend(ticket.pick(columns), {technician: technicians.get(ticket.get('technicianId')).pick('id', 'name')});
            });
        }
        return resp;
    }.bind(this));
};

Model.prototype.getPendingTickets = function() {
    var tickets, technicians;
    return TicketCollection.forge().query(function(qb) {
        if (this.bill) {

            qb.where('billId', this.bill.id).orWhereNull('billId');
            qb.whereBetween('dateCreated', [moment.unix(this.bill.dateCreated).startOf('day').unix(), moment.unix(this.bill.dateCreated).endOf('day').unix()]);
        }
        else {
            qb.whereNull('billId');
            qb.whereBetween('dateCreated', [moment().startOf('day').unix(), moment().endOf('day').unix()]);
        }
        
    }.bind(this)).fetch()
    .then(function(docs){
        tickets = docs;
        if( tickets && tickets.length > 0){
            
            
            return UserCollection.forge()
                .query(function(qb){
                    
                    qb.whereIn('id', _.uniq(tickets.pluck('technicianId')));
                })
                .fetch();
        }
        
    }.bind(this))
    .then(function(technicians){
        if( tickets && tickets.length > 0){
            var columns;
            if (this.session.roleId == Role.OWNER) {
                columns = ['id', 'dateCreated', 'nbOfTasks', 'amount', 'turnIncreasedBy', 'stateId', 'billId', 'technicianId'];
            }else{
                columns = ['id', 'dateCreated', 'nbOfTasks', 'amount', 'stateId', 'billId', 'technicianId'];
            }
            return tickets.map(function(ticket) {
                return _.extend(ticket.pick(columns), {technician: technicians.get(ticket.get('technicianId')).pick('id', 'name')});
            });
        }
        return Promise.resolve();
    }.bind(this));
};

Model.prototype.getRole = function() {
    if (this.role) {
        return Promise.resolve(this.role);
    }
    //if there is an item id, then use it for fetching the role of the current user
    if (this.actor) {
        // console.log('-->Found actor');
        if (this.workflowItem) {
            return StoreUserRole.forge()
                .query(function(qb){
                    qb.where('roleId', Role.OWNER);
                    qb.where('userId', this.actor.id);
                }.bind(this))
                .fetch()
                .then(function(sur){
                    if( sur ){
                        return Role.OWNER;
                    }
                    
                    return Role.TECHNICIAN;
                    
                }.bind(this))
                .then(function(roleId){
                    return Role.forge({id: roleId}).fetch();
                }.bind(this))
                .then(function(doc) {
                    this.role = doc;
                    return this.role;
            }.bind(this));
        }
        
        return Role.forge({
            id: Role.AUTHENTICATED_USER
        }).fetch().then(function(doc) {
            this.role = doc;
            return Promise.resolve(this.role);
        }.bind(this));

    }

    return Role.forge({
        id: Role.UNAUTHENTICATED_USER
    }).fetch().then(function(doc) {
        this.role = doc;
        return Promise.resolve(this.role);
    }.bind(this));

};


Model.prototype.updateTickets = function() {
    if( !this.params.ticketIds || this.params.ticketIds.length === 0 ){
        return Promise.reject('You must select at least one ticket!');
    }
    
    return TicketCollection.forge()
        .query(function(qb) {
            qb.whereIn('id', this.params.ticketIds);
    }.bind(this)).fetch()
    .then(function(tickets){
        return this.bill.save({
            nbOfTickets: tickets.length,
            amount: tickets.reduce(function(sum, ticket){
                return sum + ticket.amount;
            }, 0, this),
            nbOfTasks: tickets.reduce(function(sum, ticket){
                return sum + ticket.nbOfTasks;
            }, 0, this)
        }, {patch: true, transacting: this.transaction});
    }.bind(this));
};

Model.prototype.updateTip = function() {
    return this.bill.save({
        tip: this.params.tip || 0
    }, {
        patch: true,
        transacting: this.transaction
    });
};


Model.prototype.edit = function() {
    return this.bill.save({
        tip: this.params.tip || 0,
        dateCreated: this.params.dateCreated || moment().unix()
    }, {
        patch: true,
        transacting: this.transaction
    })
    .then(function(){
        var payments = [];
        //save payments
        if (this.params.payments) {
            payments = _.filter(this.params.payments, function(payment) {
                return payment.amount && payment.amount > 0;
            });
            if (payments && payments.length > 0) {
                //remove all previous payments
                return BillPaymentCollection.forge().query(function(qb) {
                    return qb.where('billId', this.bill.id);
                }.bind(this)).fetch().then(function(docs) {
                    return Promise.all(docs.map(function(doc) {
                        var found = _.find(payments, function(payment) {
                            return payment.paymentCategoryId == doc.paymentCategoryId;
                        }, this);
                        if (!found) {
                            return doc.destroy();
                        }
                        found.existingModel = doc;
                    }));
                }.bind(this)).then(function() {
                    return _.map(payments, function(payment) {
                        if (payment.existingModel) {
                            return payment.existingModel.save({
                                amount: payment.amount
                            }, {
                                transacting: this.transaction,
                                patch: true
                            });
                        }
                        return BillPayment.forge({
                            billId: this.bill.id,
                            paymentCategoryId: payment.paymentCategoryId,
                            amount: payment.amount
                        }).save(null, {
                            transacting: this.transaction
                        });
                    }, this);
                }.bind(this));
            }
        }
    }.bind(this));
    
};

Model.prototype.checkout = function() {
    return Promise.resolve();
};

Model.prototype.void = function() {
    return Promise.resolve();
};


Object.defineProperty(Model.prototype, 'bill', {
    get: function() {
        return this.item;
    }
});

Model.prototype.delete = function() {
    //start with a resolved Promise
    return Promise.resolve().then(function() {
        //delete this ticket
        return this.bill.destroy({
            transacting: this.transaction
        });
    }.bind(this));
};

module.exports = Model;
