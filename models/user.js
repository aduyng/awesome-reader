var Super = require('./base'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    Model = Super.extend({
                             tableName: 'User'
                         });

Object.defineProperty(Model.prototype, 'name', {
    get: function(){
        return this.get('name');
    },
    set: function(val){
        this.set('name', val);
        return this;
    }
})
module.exports = Model;

