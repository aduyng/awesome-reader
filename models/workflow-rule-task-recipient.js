var Super = require('./base'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    Model = Super.extend({
                             tableName: 'WorkflowRuleTaskRecipient'
                         });
module.exports = Model;