var db = require('../db');

var Model = db.Model.extend({
    tableName: 'DailySummary'
});


module.exports = Model;
