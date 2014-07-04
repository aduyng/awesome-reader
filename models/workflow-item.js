var Super = require('./base'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    Model = Super.extend({
                             tableName: 'WorkflowItem'
                         });

Object.defineProperty(Model.prototype, 'stateId', {
    get: function () {
        return parseInt(this.get('stateId'), 10);
    },
    set: function (val) {
        this.set('stateId', val);
        return this;
    }
});

module.exports = Model;

