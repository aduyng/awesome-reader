define(function (require) {
    var Super = require('./base');

    var Model = Super.extend({
                             });

    Object.defineProperty(Model.prototype, 'actionId', {
        get: function () {
            var v = this.get('actionId');
            if (_.isString(v)) {
                v = parseInt(v, 10);
                this.set('actionId', v);
            }
            return v;
        }
    });

    return Model;
});