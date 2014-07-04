var Super = require('./base'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    Model = Super.extend({
                             tableName: 'WorkflowTodoTemplate'
                         });
module.exports = Model;

