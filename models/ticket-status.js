var db = require('../db');

var Model = db.Model.extend({
    tableName: 'TicketStatus'
});

Model.PENDING = 1;
Model.BILLED = 2;
Model.PAID = 3;

module.exports = Model;
