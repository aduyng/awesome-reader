/*global Backbone, _*/
define(function (require) {
    var Super = Backbone.Model;

    var Model = Super.extend({
                             });
    Object.defineProperty(Model.prototype, 'socket', {
        get: function () {
            return window.app.socket;
        }
    });

    Object.defineProperty(Model.prototype, 'ds', {
        get: function () {
            return window.app.ds;
        }
    });
    
    return Model;
});