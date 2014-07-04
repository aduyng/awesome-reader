define(function (require) {
    var Super = require('./base');

    var Model = Super.extend({
        urlRoot: '/rest/store'
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
    Object.defineProperty(Model.prototype, 'alias', {
        get: function () {
            return this.get('alias');
        },
        set: function (val) {
            this.set('alias', val);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'email', {
        get: function () {
            return this.get('email');
        },
        set: function (val) {
            this.set('email', val);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'phone', {
        get: function () {
            return this.get('phone');
        },
        set: function (val) {
            this.set('phone', val);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'address', {
        get: function () {
            return this.get('address');
        },
        set: function (val) {
            this.set('address', val);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'isActive', {
        get: function () {
            return this.get('isActive') === 1;
        },
        set: function (val) {
            this.set('isActive', (val ? 1 : 0));
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'defaultCommissionRatio', {
        get: function () {
            return this.get('defaultCommissionRatio');
        },
        set: function (val) {
            this.set('defaultCommissionRatio', val);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'turnThresholdAmount', {
        get: function () {
            return this.get('turnThresholdAmount');
        },
        set: function (val) {
            this.set('turnThresholdAmount', val);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'isAutoTipDivision', {
        get: function () {
            return this.get('isAutoTipDivision') === 1;
        },
        set: function (val) {
            this.set('isAutoTipDivision', val ? 1 : 0);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'isAutoTaskAssignment', {
        get: function () {
            return this.get('isAutoTaskAssignment') === 1;
        },
        set: function (val) {
            this.set('isAutoTaskAssignment', val ? 1 : 0);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'taskAssignmentMethodId', {
        get: function () {
            return this.get('taskAssignmentMethodId');
        },
        set: function (val) {
            this.set('taskAssignmentMethodId', val);
            return this;
        }
    });


    return Model;
});