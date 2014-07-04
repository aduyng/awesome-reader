var db = require('../db'),
    _ = require('underscore');

var Model = db.Model.extend({
    tableName: 'Bill',
    defaults: {
        nbOfTasks: 0,
        nbOfTickets: 0,
        amount: 0
    }

});


Object.defineProperty(Model.prototype, 'dateCreated', {
    get: function() {
        var v = this.get('dateCreated');
        if (!_.isNumber(v)) {
            v = parseInt(v, 10);
            this.set('dateCreated', v);
        }
        return v;
    },
    set: function(val) {
        this.set('dateCreated', val);
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

module.exports = Model;
