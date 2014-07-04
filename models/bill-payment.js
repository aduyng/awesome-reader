var db = require('../db'),
    _ = require('underscore'),

    Model = db.Model.extend({
        tableName: 'BillPayment'
    });



Object.defineProperty(Model.prototype, 'paymentCategoryId', {
    get: function() {
        var v = this.get('paymentCategoryId');
        if (!_.isNumber(v)) {
            v = parseInt(v, 10);
            this.set('paymentCategoryId', v);
        }
        return v;
    },
    set: function(val) {
        this.set('paymentCategoryId', val);
        return this;
    }
});


module.exports = Model;
