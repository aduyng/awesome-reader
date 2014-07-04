var db = require('../db');

var Model = db.Model.extend({
    tableName: 'BillTip'
});


module.exports = Model;
