define(function(require) {
    var Super = require('./base');

    var Model = Super.extend({
        urlRoot: 'rest/user'
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

    Object.defineProperty(Model.prototype, 'phone', {
        get: function() {
            return this.get('phone');
        },
        set: function(val) {
            this.set('phone', val);
            return this;
        }
    });


    return Model;
});