define(function (require) {
    var Super = require('./base');

    var Model = Super.extend({
    }, {
        CASH: 1,
        CHECK: 2,
        CREDIT_CARD: 3,
        OTHER: 4
    });
    
    Object.defineProperty(Model.prototype, 'name', {
        get: function () {
            return this.get('name');
        },
        set: function (val) {
            this.set('name', val);
            return this;
        }
    });
    return Model;
});