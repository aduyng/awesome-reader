define(function (require) {
    var Super = require('./base'),
        Model = require('../models/workflow-rule');

    var Collection = Super.extend({
        model: Model
    });

    Collection.prototype.getByActionId = function(actionId){
        return this.find(function(rule){
            return rule.actionId == actionId;
        });
    };

    return Collection;
});