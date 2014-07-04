var db = require('../db');

var Model = db.Model.extend({
    tableName: 'Action'
}, {
    CREATE: 1,
    VIEW: 2,
    UPDATE_TASKS: 3,
    CHANGE_TECHNICIAN: 4,
    UPDATE_TICKET_TECHNICIAN_INFO: 5,
    VIEW_TICKET_TECHNICIAN_INFO: 6,
    CHANGE_TICKET_PRICE: 7,
    EDIT: 8,
    DELETE: 9,
    CHECKOUT: 10
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

module.exports = Model;
