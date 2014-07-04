/*global _*/
define(function(require) {
    var Super = require('./base'),
        User = require('./user'),
        TicketCollection = require('collections/ticket'),
        PaymentCollection = require('collections/bill-payment');

    var Model = Super.extend({});



    Object.defineProperty(Model.prototype, 'tickets', {
        get: function() {
            var v = this.get('tickets');
            if (!(v instanceof TicketCollection)) {
                v = new TicketCollection(v);
                this.set('tickets', v);
            }
            return v;
        }
    });

    Object.defineProperty(Model.prototype, 'state', {
        get: function() {
            return this.ds.billStatuses.get(this.stateId);
        }
    });


    Object.defineProperty(Model.prototype, 'stateId', {
        get: function() {
            var v = this.get('stateId');
            if (!_.isNumber(v)) {
                v = parseInt(v, 10);
                this.set('stateId', v);
            }
            return v;
        },
        set: function(val) {
            this.set('stateId', val);
        }
    });

    Object.defineProperty(Model.prototype, 'customerId', {
        get: function() {
            var v = this.get('customerId');
            if (!_.isNumber(v)) {
                v = parseInt(v, 10);
                this.set('customerId', v);
            }
            return v;
        },
        set: function(val) {
            this.set('customerId', val);
        }
    });


    Object.defineProperty(Model.prototype, 'customer', {
        get: function() {
            var v = this.get('customer');

            if (!v) {
                v = new User({
                    id: 0,
                    name: 'Walk-in',
                    phone: '9999999999'
                });
                this.customer = v;
            }

            if (!(v instanceof User)) {
                v = new User(v);
                this.customer = v;
            }

            return v;
        },
        set: function(v) {
            this.set('customer', v);
            return this;
        }
    });


    Object.defineProperty(Model.prototype, 'payments', {
        get: function() {
            var v = this.get('payments');
            if (!(v instanceof PaymentCollection)) {
                v = new PaymentCollection(v);
                this.set('payments', v);
            }
            return v;
        }
    });


    Object.defineProperty(Model.prototype, 'amount', {
        get: function() {
            var v = this.get('amount');
            if (!_.isNumber(v)) {
                v = parseFloat(v);
                this.set('amount', v);
            }
            return v;
        },
        set: function(val) {
            this.set('amount', val);
        }
    });




    Object.defineProperty(Model.prototype, 'tip', {
        get: function() {
            var v = this.get('tip');
            if (!_.isNumber(v)) {
                v = parseFloat(v);
                this.set('tip', v);
            }
            return v;
        },
        set: function(val) {
            this.set('tip', val);
        }
    });

    return Model;
});