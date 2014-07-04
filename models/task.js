var db = require('../db');

var Model = db.Model.extend({
    tableName: 'Task'
});


module.exports = Model;
