define(function(require) {
    var Super = require('./base');

    var Model = Super.extend({}, {});


    Object.defineProperty(Model.prototype, 'paymentMethodId', {
        get: function() {
            var v = this.get('paymentMethodId');
            if (!_.isNumber(v)) {
                v = parseInt(v, 10);
                this.set('paymentMethodId', v);
            }
            return v;
        },
        set: function(val) {
            this.set('paymentMethodId', val);
        }
    });


    return Model;
});