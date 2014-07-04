var _ = require('underscore'),
    moment = require('moment'),
    accounting = require('accounting'),
    Super = require('./base'),
    Ticket = require('../ticket'),
    Store = require('../store'),
    WorkflowItemUserRole = require('../workflow-item-user-role'),
    Role = require('../role'),
    User = require('../user'),
    Task = require('../task'),
    Workflow = require('../workflow'),
    TicketStatus = require('../ticket-status'),
    Action = require('../action'),
    Bill = require('../bill'),
    TaskCollection = require('../../collections/task'),
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

        return Ticket.forge({
            id: itemId
        }).fetch().then(function(t) {
            this.item = t;
            return Promise.resolve(t);
        }.bind(this));
    }

    return Promise.resolve(this.item);
};

Model.prototype.create = function() {

    return Promise.all([
    StoreUserRole.forge().query(function(qb) {
        qb.where('storeId', this.session.storeId).where('userId', this.actor.id);
    }.bind(this)).fetch(),
    Store.forge({
        id: this.session.storeId
    }).fetch()]).spread(function(sur, store) {

        return Ticket.forge({
            storeId: this.session.storeId,
            dateCreated: this.params.now || moment().unix(),
            nbOfTasks: 0,
            amount: 0,
            tip: 0,
            commissionRatio: sur.get('commissionRatio') || store.get('defaultCommissionRatio') || 0,
            tipDivisionRatio: store.get('defaultTipDeductionRatio') || 0,
            turnIncreasedBy: 0,
            technicianId: this.params.technicianId
        }).save();
    }.bind(this));

};


Model.prototype.view = function() {
    var resp = _.extend(this.ticket.toJSON(), {stateId: this.workflowItem.stateId});

    return Promise.resolve().then(function() {
        return TaskCollection.forge().query(function(qb) {
            qb.where('ticketId', this.ticket.id);
        }.bind(this)).fetch();
    }.bind(this)).then(function(tasks) {
        resp.tasks = tasks.toJSON();
        
    }.bind(this)).then(function(tasks) {
        return User.forge({
            id: this.ticket.technicianId
        }).fetch()
    }.bind(this)).then(function(doc) {
        resp.technician = doc.pick('id', 'name');
        return resp;
    }.bind(this));

};

Model.prototype.changeTechnician = function() {
    var amount = 0,
        nbOfTasks = 0;
    if (!this.params.technicianId) {
        return Promise.reject(Handlebars.compile('You must select the new technician to change!')({}));
    }

    return Promise.resolve().then(function() {
        //revoke the role of the previous user
        return this.revokeRole(this.ticket.technicianId, Role.TECHNICIAN);
    }.bind(this)).then(function() {
        //select store-user-role 
        return StoreUserRole.forge().query(function(qb) {
            qb.where('userId', this.params.technicianId);
            qb.where('storeId', this.session.storeId);
        }.bind(this)).fetch();
    }.bind(this)).then(function(sur) {
        return this.ticket.save({
            commissionRatio: sur.commissionRatio,
            technicianId: this.params.technicianId
        }, {
            patch: true,
            transacting: this.transaction
        });
    }.bind(this)).then(function() {
        if (this.role.id == Role.OWNER && this.params.technicianId == this.actor.id) {
            return Promise.resolve();
        }
        console.log('reassign role'.red);
        //assign technician role for the new user
        return this.assignRole(this.params.technicianId, Role.TECHNICIAN);
    }.bind(this));


};

Model.prototype.updateTasks = function() {
    var amount = 0,
        nbOfTasks = 0;
    if (!this.params.productIds || this.params.productIds.length === 0) {
        return Promise.reject(Handlebars.compile('You must select at least one product!')({}));
    }

    return Promise.resolve().then(function() {
        //remove previous tasks
        return TaskCollection.forge().query(function(qb) {
            qb.where('ticketId', this.ticket.id);
            qb.transacting(this.transaction);
        }.bind(this)).fetch();
    }.bind(this)).then(function(tasks) {
        return Promise.all(tasks.map(function(task) {
            return task.destroy({
                transacting: this.transaction
            });
        }.bind(this)));
    }.bind(this)).then(function() {
        //fetch all products
        return ProductCollection.forge().query(function(qb) {
            qb.join('ProductCategory', 'ProductCategory.id', '=', 'Product.categoryId');
            qb.where('ProductCategory.storeId', this.session.storeId);
            qb.whereIn('Product.id', this.params.productIds);
        }.bind(this)).fetch();
    }.bind(this)).then(function(products) {
        nbOfTasks = products.length;
        return Promise.all(products.map(function(product) {
            amount += parseFloat(product.price);
            return Task.forge({
                productId: product.id,
                price: product.price,
                ticketId: this.ticket.id
            }).save(null, {
                transacting: this.transaction
            });
        }.bind(this)))
    }.bind(this)).then(function(tasks) {
        return Store.forge({
            id: this.session.storeId
        }).fetch();
    }.bind(this)).then(function(store) {
        return this.ticket.save({
            turnIncreasedBy: Math.floor(amount / store.turnThresholdAmount),
            amount: amount,
            nbOfTasks: nbOfTasks
        }, {
            patch: true,
            transacting: this.transaction
        });
    }.bind(this));
};


Model.prototype.initRoles = function() {
    
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
                    if( this.ticket.technicianId == this.actor.id){
                        return Role.TECHNICIAN;
                    }
                    return Role.OTHER_TECHNICIAN;
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



Model.prototype.listOfServicesSeparatedByComma = function() {
    return ProductCollection.forge().query(function(qb) {
        qb.join('Task', 'Task.productId', '=', 'Product.id');
        qb.where('Task.ticketId', this.ticket.id)
        qb.column('Product.name');
        qb.orderBy('Product.name');
    }.bind(this)).fetch().then(function(docs) {
        if (docs && docs.length > 0) {
            return docs.pluck('name').join(', ');
        }
        return null;
    });

};


Model.prototype.formattedAmount = function() {
    return accounting.formatMoney(this.ticket.amount);
};

/**
 * return the name of the newly assigned technician 
 **/
Model.prototype.newTechnicianName = function() {
    if (this.params.technicianId) {
        return User.forge({
            id: this.params.technicianId
        }).fetch().then(function(user) {
            if (user) {
                return user.name;
            }
        });
    }
};

Model.prototype.technicianName = function() {
    return User.forge({
        id: this.ticket.get('technicianId')
    }).fetch({
        transacting: this.transaction
    })

    .then(function(doc) {
        return doc.get('name');
    });
};


Object.defineProperty(Model.prototype, 'ticket', {
    get: function() {
        return this.item;
    }
});

Model.prototype.updateTechnicianInfo = function() {
    return this.ticket.save(_.pick(this.params, 'turnIncreasedBy', 'commissionRatio', 'tipDivisionRatio'), {
        transacting: this.transaction,
        patch: true
    });
};

Model.prototype.changeTicketPrice = function() {
    var amount = 0;
    if (!this.params.tasks || this.params.tasks.length === 0) {
        return Promise.reject(Handlebars.compile('There are no new price to update!')({}));
    }

    return Promise.resolve().then(function(products) {
        return Promise.all(this.params.tasks.map(function(task) {
            var price = parseFloat(task.price);
            amount += price;

            return Task.forge({
                id: task.id
            }).save({
                price: price
            }, {
                transacting: this.transaction,
                patch: true
            });
        }.bind(this)))
    }.bind(this)).then(function(store) {
        return this.ticket.save({
            amount: amount
        }, {
            patch: true,
            transacting: this.transaction
        });
    }.bind(this));
};

Model.prototype.edit = function() {
    return Promise.resolve().then(function(store) {
        return this.ticket.save(_.pick(this.params, 'dateCreated'), {
            patch: true,
            transacting: this.transaction
        });
    }.bind(this));
};


Model.prototype.delete = function() {
    //start with a resolved Promise
    return Promise.resolve().then(function() {
        //delete this ticket
        return this.ticket.destroy({
            transacting: this.transaction
        });
    }.bind(this));
};

Model.prototype.checkout = function() {
    if( this.workflowItem.stateId === TicketStatus.PENDING ){
        return this.ticket.save({billId: this.params.billId}, {transacting: this.transaction, patch: true});        
    }
    return Promise.resolve();
};

Model.prototype.uncheckout = function() {
    //call bill workflow to create a new bill and add this ticket to that bill
    return this.ticket.save({billId: null}, {transacting: this.transaction, patch: true});    
};

Model.prototype.updateTip = function() {
    return this.ticket.save({
        tip: this.params.tip || 0
    }, {
        patch: true,
        transacting: this.transaction
    });
};


module.exports = Model;
