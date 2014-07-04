define(function (require) {
    var Super = Backbone.Model,
        Role = require('./models/role');


    var Model = Super.extend({
                                 url: '/session'
                             });

    Object.defineProperty(Model.prototype, 'isOwner', {
        get: function () {
            return this.roleId === Role.OWNER;
        }
    });

    Object.defineProperty(Model.prototype, 'roleId', {
        get: function () {
            var roleId = this.get('roleId');
            if (_.isString(roleId)) {
                return parseInt(this.get('roleId'), 10);
            }
            return roleId;
        }
    });


    Object.defineProperty(Model.prototype, 'userId', {
        get: function () {
            return this.get('userId');
        }
    });


    Object.defineProperty(Model.prototype, 'storeId', {
        get: function () {
            return this.get('storeId');
        }
    });


    return Model;
});