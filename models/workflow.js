var Super = require('./base'),
    Promise = require('bluebird'),
    _ = require('underscore'),
    _s = require('underscore.string'),

    Model = Super.extend({
        tableName: 'Workflow'
    });
    
Model.TICKET = 1;
Model.BILL = 2;

Model.prototype.getDriver = function(options) {
    var WorkflowDriverClass = require('./workflow/' + _s.dasherize(this.driverClass).replace(/^-/, ''));
    var driver = WorkflowDriverClass.forge({workflow: this});

    return driver.init(options).then(function() {
        return driver;
    });
};

Object.defineProperty(Model.prototype, 'driverClass', {
    get: function() {
        return this.get('driverClass');
    },
    set: function(val) {
        this.set('driverClass', val);
        return this;
    }
});


Object.defineProperty(Model.prototype, 'name', {
    get: function() {
        return this.get('name');
    },
    set: function(val) {
        this.set('name', val);
        return this;
    }
});



module.exports = Model;
