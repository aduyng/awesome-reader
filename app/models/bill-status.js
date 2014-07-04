define(function(require) {
    var Super = require('./base');

    var Model = Super.extend({}, {
        PENDING: 5,
        PAID: 6,
        VOIDED: 7,
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
            case Model.PAID:
                return 'fa-pencil-square';
            case Model.VOIDED:
                return 'fa-trash-o';
            }
        }
    });

    Object.defineProperty(Model.prototype, 'buttonClass', {
        get: function() {
            switch (this.id) {
            case Model.PENDING:
                return 'btn-warning';
            case Model.VOIDED:
                return 'btn-default';
            case Model.PAID:
                return 'btn-success';
            }
        }
    });
    return Model;
});