define(function (require) {
    var Super = require('./base'),
        Promise = require('bluebird'),
        Action = require('models/action'),
        Handlebars = require('hbs/handlebars'),
        WorkflowRuleCollection = require('collections/workflow-rule');

    var Model = Super.extend({
                                 url: 'rest/workflow'
                             });

    Model.prototype.load = function(itemId){
        var parts = ['rest', 'workflow', this.id];
        
        if (itemId) {
            parts.push('item');
            parts.push(itemId);
        }

        return Promise.resolve()
            .then(function(){
                return this.socket.request({
                    url  : parts.join('/')
                });       
            }.bind(this)).then(function(resp){
                this.set(resp);
            }.bind(this));
    };

    Model.prototype.process = function (actionId, itemId, params, force) {
        if( !actionId ){
            throw new Error(Handlebars.compile('actionId is required! Did you forget to define this id in action.js?')({
            }));
        }
        //make sure that actionId is in the list of loaded rules
        
        if (!force && !this.rules.getByActionId(actionId)) {
            var action = this.ds.actions.get(actionId);
            if( !action ) {
                throw new Error(Handlebars.compile('Action ({{id}}) is NOT found!')({
                                                                                               id  : actionId
                                                                                           }));    
            }
            throw new Error(Handlebars.compile('Action {{name}} ({{id}}) is NOT allowed!')({
                                                                                               name: action.name,
                                                                                               id  : actionId
                                                                                           }));
        }

        var parts = ['rest', 'workflow', this.id, 'action', actionId];
        if (itemId) {
            parts.push('item');
            parts.push(itemId);
        }

        return this.socket.request({
                                       url  : parts.join('/'),
                                       data : params,
                                       type : 'POST',
                                       async: true
                                   });
    };

    Object.defineProperty(Model.prototype, 'rules', {
        get: function () {
            var v = this.get('rules');
            if (!(v instanceof WorkflowRuleCollection)) {
                v = new WorkflowRuleCollection(v);
                this.set('rules', v);
            }
            return v;
        }
    });

    return Model;
});