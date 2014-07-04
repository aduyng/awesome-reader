define(function (require) {
    var Super = require('./base');

    var Model = Super.extend({
                                 url: '/session'
                             });


    Object.defineProperty(Model.prototype, 'userId', {
        get: function () {
            return this.get('userId');
        }
    });

    return Model;
});