var db = require('../db');

var Model = db.Model.extend({
                                tableName: 'WorkflowTaskType'
                            });

Model.CREATE_TODO = 1;
Model.CREATE_FEED = 2;
Model.CREATE_ACTIVITY = 3;


Model.CLEAR_TODO = 100;


module.exports = Model;