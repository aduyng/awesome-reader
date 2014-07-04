var db = require('../db');

var Model = db.Model.extend({
    tableName: 'BillStatus'
}, {
    PENDING: 5,
    PAID: 6,
    VOIDED: 7,
});

module.exports = Model;
