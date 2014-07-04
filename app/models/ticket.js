define(function (require) {
    var _ = require('underscore'),
        Super = require('./base'),
        User = require('./user'),
        TaskCollection = require('../collections/task');

    var Model = Super.extend({
    });

    
    Object.defineProperty(Model.prototype, 'technician', {
        get: function () {
            var v = this.get('technician');
            if( v ){
                return new User(v);
            }
        }
    });
    
    Object.defineProperty(Model.prototype, 'state', {
        get: function () {
            return this.ds.ticketStatuses.get(this.stateId);
        }
    });


    Object.defineProperty(Model.prototype, 'tasks', {
        get: function () {
            var v = this.get('tasks');
            if (!(v instanceof TaskCollection)) {
                v = new TaskCollection(v);
                this.set('tasks', v);
            }
            return v;
        }
    });

    Object.defineProperty(Model.prototype, 'stateId', {
        get: function () {
            var v = this.get('stateId');
            if (!_.isNumber(v)) {
                v = parseInt(v, 10);
                this.set('stateId', v);
            }
            return v;
        },
        set: function(val){
            this.set('stateId', val);
        }
    });
    
    Object.defineProperty(Model.prototype, 'billId', {
        get: function () {
            var v = this.get('billId');
            if (!_.isNumber(v)) {
                v = parseInt(v, 10);
                this.set('billId', v);
            }
            return v;
        },
        set: function(val){
            this.set('billId', val);
        }
    });
    
    
    Object.defineProperty(Model.prototype, 'amount', {
        get: function () {
            var v = this.get('amount');
            if (!_.isNumber(v)) {
                v = parseFloat(v);
                this.set('amount', v);
            }
            return v;
        },
        set: function(val){
            this.set('amount', val);
        }
    });

    Object.defineProperty(Model.prototype, 'technicianId', {
        get: function () {
            var v = this.get('technicianId');
            if (!_.isNumber(v)) {
                v = parseInt(v, 10);
                this.set('technicianId', v);
            }
            return v;
        },
        set: function(val){
            this.set('technicianId', val);
        }
    });

    Object.defineProperty(Model.prototype, 'dateCreated', {
        get: function () {
            var v = this.get('dateCreated');
            if (!_.isNumber(v)) {
                v = parseInt(v, 10);
                this.set('dateCreated', v);
            }
            return v;
        },
        set: function(val){
            this.set('dateCreated', val);
        }
    });
    
    return Model;
});