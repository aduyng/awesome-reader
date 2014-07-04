define(function (require) {
    var Super = require('./base');

    var Model = Super.extend({
                                 urlRoot: '/rest/feed'
                             });

    Object.defineProperty(Model.prototype, 'dateCreated', {
        get: function () {
            return this.get('dateCreated');
        },
        set: function (val) {
            this.set('dateCreated', val);
            return this;
        }
    });
    Object.defineProperty(Model.prototype, 'isRead', {
        get: function () {
            return this.get('isRead');
        },
        set: function (val) {
            this.set('isRead', val);
            return this;
        }
    });

    return Model;
});