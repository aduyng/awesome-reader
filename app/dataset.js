/*global Backbone*/
define(function(require) {
    var Super = Backbone.Model,
        RoleCollection = require('./collections/role'),
        Role = require('./models/role'),
        Store = require('./models/store'),
        TicketStatusCollection = require('./collections/ticket-status'),
        CategoryCollection = require('./collections/category'),
        ActionCollection = require('./collections/action'),
        FeedCollection = require('./collections/feed'),
        TodoCollection = require('./collections/todo'),
        UserCollection = require('./collections/user'),
        ProductCollection = require('./collections/product'),
        TicketStatus = require('./models/ticket-status'),
        PaymentCategory = require('./models/payment-category'),
        BillStatusCollection = require('./collections/bill-status'),
        PaymentCategoryCollection = require('./collections/payment-category'),
        BillStatus = require('./models/bill-status');


    var roles = new RoleCollection();
    roles.add([{
        id: Role.OWNER,
        name: 'Owner'
    }, {
        id: Role.TECHNICIAN,
        name: 'Technician'
    }]);

    var ticketStatuses = new TicketStatusCollection();
    ticketStatuses.add([{
        id: TicketStatus.PENDING,
        name: 'Pending'
    }, {
        id: TicketStatus.BILLED,
        name: 'Billed'
    }, {
        id: TicketStatus.PAID,
        name: 'Paid'
    }]);
    var billStatuses = new BillStatusCollection();
    billStatuses.add([{
        id: BillStatus.PENDING,
        name: 'Pending'
    }, {
        id: BillStatus.PAID,
        name: 'Paid'
    },{
        id: BillStatus.VOIDED,
        name: 'Voided'
    }]);

    var paymentCategories = new PaymentCategoryCollection();
    paymentCategories.add([{
        id: PaymentCategory.CREDIT_CARD,
        name: 'Credit Card'
    }, {
        id: PaymentCategory.CASH,
        name: 'Cash'
    }, {
        id: PaymentCategory.CHECK,
        name: 'Check'
    }, {
        id: PaymentCategory.OTHER,
        name: 'Other'
    }]);

    var Model = Super.extend({
        defaults: {
            roles: roles,
            ticketStatuses: ticketStatuses,
            billStatuses: billStatuses,
            paymentCategories: paymentCategories
        },
        url: '/dataset'
    });

    Object.defineProperty(Model.prototype, 'roles', {
        get: function() {
            return this.get('roles');
        }
    });

    Object.defineProperty(Model.prototype, 'ticketStatuses', {
        get: function() {
            return this.get('ticketStatuses');
        }
    });

    Object.defineProperty(Model.prototype, 'billStatuses', {
        get: function() {
            return this.get('billStatuses');
        }
    });
    Object.defineProperty(Model.prototype, 'paymentCategories', {
        get: function() {
            return this.get('paymentCategories');
        }
    });


    Object.defineProperty(Model.prototype, 'users', {
        get: function() {
            throw new Error('dataset.users is deprecated!');
            var v = this.get('users');
            if (!(v instanceof UserCollection)) {
                v = new UserCollection(v);
                this.set('users', v);
            }
            return v;
        }
    });

    Object.defineProperty(Model.prototype, 'store', {
        get: function() {
            var v = this.get('store');
            if (!(v instanceof Store)) {
                v = new Store(v);
                this.set('store', v);
            }
            return v;
        }
    });


    Object.defineProperty(Model.prototype, 'products', {
        get: function() {
            if (!(v instanceof ProductCollection)) {
                var categories = this.categories;

                var v = new ProductCollection();
                categories.forEach(function(category) {
                    var products = category.products;
                    if (products && products.length > 0) {
                        products.forEach(function(product) {
                            v.add(product);
                        });
                    }

                });

                this.set('products', v);
            }
            return v;
        }
    });


    Object.defineProperty(Model.prototype, 'categories', {
        get: function() {
            var v = this.get('categories');
            if (!(v instanceof CategoryCollection)) {
                v = new CategoryCollection(v);
                this.set('categories', v);
            }
            return v;
        }
    });

    Object.defineProperty(Model.prototype, 'feeds', {
        get: function() {
            var v = this.get('feeds');
            if (!(v instanceof FeedCollection)) {
                v = new FeedCollection(v);
                this.set('feeds', v);
            }
            return v;
        }
    });

    Object.defineProperty(Model.prototype, 'todos', {
        get: function() {
            var v = this.get('todos');
            if (!(v instanceof TodoCollection)) {
                v = new TodoCollection(v);
                this.set('todos', v);
            }
            return v;
        }
    });

    Object.defineProperty(Model.prototype, 'actions', {
        get: function() {
            var v = this.get('actions');
            if (!(v instanceof ActionCollection)) {
                v = new ActionCollection(v);
                this.set('actions', v);
            }
            return v;
        }
    });

    return Model;
});