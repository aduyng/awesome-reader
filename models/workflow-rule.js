var Super = require('./base'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    Model = Super.extend({
                             tableName: 'WorkflowRule'
                         });
Object.defineProperty(Model.prototype, 'methodId', {
    get: function(){
        var v = this.get('methodId');
        if( !_.isNumber(v) ){
            v = parseInt(v, 10);
            this.set('methodId', v);
        }
        return v;
    },
    set: function(val){
        this.set('methodId', val);
        return this;
    }
});


Object.defineProperty(Model.prototype, 'isEntry', {
    get: function(){
        return this.get('isEntry');
    },
    set: function(val){
        this.set('isEntry', val);
        return this;
    }
});



Object.defineProperty(Model.prototype, 'postStateId', {
    get: function(){
        var v = this.get('postStateId');
        if( !_.isNumber(v) ){
            v = parseInt(v, 10);
            this.set('postStateId', v);
        }
        return v;
    },
    set: function(val){
        this.set('postStateId', val);
        return this;
    }
});



module.exports = Model;

