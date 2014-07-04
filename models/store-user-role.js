var _ = require('underscore'),
    Super = require('./base'),
    User = require('./user');

var Model = Super.extend({
    tableName: 'StoreUserRole',
    user: function() {
        return this.belongsTo(User, 'userId');
    }
});


Object.defineProperty(Model.prototype, "userId", {
    get: function() {
        var v = this.get("userId");
        if (!_.isNumber(v)) {
            v = parseInt(v, 10);
            this.set("userId", v);
        }
        return v;
    },
    set: function(v) {
        this.set("userId", v);
        return this;
    }

});

Object.defineProperty(Model.prototype, "roleId", {
    get: function() {
        var v = this.get("roleId");
        if (!_.isNumber(v)) {
            v = parseInt(v, 10);
            this.set("roleId", v);
        }
        return v;
    },
    set: function(v) {
        this.set("roleId", v);
        return this;
    }

});
Object.defineProperty(Model.prototype, "commissionRatio", {
    get: function() {
        var v = this.get("commissionRatio");
        if (!_.isNumber(v)) {
            v = parseInt(v, 10);
            this.set("commissionRatio", v);
        }
        return v;
    },
    set: function(v) {
        this.set("commissionRatio", v);
        return this;
    }

});


module.exports = Model;
