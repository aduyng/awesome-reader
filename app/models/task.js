define(function (require) {
    var Super = require('./base');

    var Model = Super.extend({
    });

    Model.prototype.meta = {
        name: 'Task'
    };


    Object.defineProperty(Model.prototype, 'price', {
        get: function () {
            return this.get('price');
        },
        set: function (val) {
            this.set('price', val);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'tip', {
        get: function () {
            return this.get('tip');
        },
        set: function (val) {
            this.set('tip', val);
            return this;
        }
    });

    Object.defineProperty(Model.prototype, 'ticketId', {
        get: function () {
            return this.get('ticketId');
        },
        set: function (val) {
            this.set('ticketId', val);
            return this;
        }
    });

    Object.defineProperty(Model.prototype, 'productId', {
        get: function () {
            return this.get('productId');
        },
        set: function (val) {
            this.set('productId', val);
            return this;
        }
    });

    Object.defineProperty(Model.prototype, 'assigneeId', {
        get: function () {
            return this.get('assigneeId');
        },
        set: function (val) {
            this.set('assigneeId', val);
            return this;
        }
    });


    return Model;
});