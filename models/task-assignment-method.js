var db = require('../db');

var Model = db.Model.extend({
    tableName: 'TaskAssignmentMethod'
}, {
    INCOME: 1,
    NUMBER_OF_TURNS: 2
});

module.exports = Model;
