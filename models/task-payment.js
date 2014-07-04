var db = require('../db');

var Model = db.Model.extend({
    tableName: 'TaskPayment'
});


module.exports = Model;
