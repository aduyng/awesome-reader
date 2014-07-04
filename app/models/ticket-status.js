define(function(require) {
    var Super = require('./base');

    var Model = Super.extend({}, {
        PENDING: 1,
        BILLED: 2,
        PAID: 3
    });


    Object.defineProperty(Model.prototype, 'name', {
        get: function() {
            return this.get('name');
        },
        set: function(val) {
            this.set('name', val);
            return this;
        }
    });


    Object.defineProperty(Model.prototype, 'iconClass', {
        get: function() {
            switch (this.id) {
            case Model.PENDING:
                return 'fa-pencil-square-o';
            case Model.BILLED:
                return 'fa-pencil-square';
            case Model.PAID:
                return 'fa-dollar';
            }
        }
    });

    Object.defineProperty(Model.prototype, 'buttonClass', {
        get: function() {
            switch (this.id) {
            case Model.PENDING:
                return 'btn-warning';
            case Model.BILLED:
                return 'btn-info';
            case Model.PAID:
                return 'btn-success';
            }
        }
    });

    return Model;
});