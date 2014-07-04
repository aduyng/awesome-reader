define(function(require) {
    var Super = require('./base');

    var Model = Super.extend({}, {
        CREATE: 1,
        VIEW: 2,
        UPDATE_TASKS: 3,
        CHANGE_TECHNICIAN: 4,
        UPDATE_TICKET_TECHNICIAN_INFO: 5,
        VIEW_TICKET_TECHNICIAN_INFO: 6,
        CHANGE_TICKET_PRICE: 7,
        EDIT: 8,
        DELETE: 9,
        CHECKOUT: 10,
        GET_PENDING_TICKETS: 11,
        UPDATE_TICKETS: 12,
        UNCHECKOUT: 13,
        UPDATE_TIP: 14,
        VOID: 15
        
    });

    Object.defineProperty(Model.prototype, 'name', {
        get: function() {
            return this.get('name');
        }
    });

    return Model;
});