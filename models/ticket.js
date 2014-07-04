var db = require('../db'),
    _ = require('underscore');

var Model = db.Model.extend({
    tableName: 'Ticket'
});

Object.defineProperty(Model.prototype, 'technicianId', {
    get: function(){
        var v = this.get('technicianId');
        if( !_.isNumber(v) ){
            v = parseInt(v, 10);
            this.set('technicianId', v);
        }
        return v;
    },
    set: function(val){
        this.set('technicianId', val);
        return this;
    }
});


Object.defineProperty(Model.prototype, 'nbOfTasks', {
    get: function(){
        var v = this.get('nbOfTasks');
        if( !_.isNumber(v) ){
            v = parseInt(v, 10);
            this.set('nbOfTasks', v);
        }
        return v;
    },
    set: function(val){
        this.set('nbOfTasks', val);
        return this;
    }
});


Object.defineProperty(Model.prototype, 'amount', {
    get: function(){
        var v = this.get('amount');
        if( !_.isNumber(v) ){
            v = parseFloat(v);
            this.set('amount', v);
        }
        return v;
    },
    set: function(val){
        this.set('amount', val);
        return this;
    }
});



module.exports = Model;
