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
//
//    Model.prototype.initialize = function () {
//        if (!this.id) {
//            this.id = 'session';
//        }
//        this.fetch();
//        this.on('change', this.save, this);
//    };
//
//    Model.prototype.fetch = function () {
//        var data = sessionStorage.getItem(this.id);
//        if( data ){
//            this.set(JSON.parse(data));
//        }
//    };
//
//    Model.prototype.save = function (attributes) {
//        sessionStorage.setItem(this.id, JSON.stringify(this.toJSON()));
//    };
//
//    Model.prototype.destroy = function (options) {
//        sessionStorage.removeItem(this.id);
//    };
//
//    Model.prototype.isEmpty = function () {
//        return (_.size(this.attributes) <= 1); // just 'id'
//    };

    return Model;
});