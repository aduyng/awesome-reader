var db = require('../db');

var Model = db.Model.extend({
    tableName: 'PaymentCategory'
});


module.exports = Model;
