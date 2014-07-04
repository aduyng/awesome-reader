/*global Backbone, _*/
define(function (require) {
    var Super = Backbone.Model;
    var moment = require('moment');
    var Model = Super.extend({
                             });

    Model.prototype.initialize = function (options) {
    };

    Model.prototype.request = function (options) {
        if (!options) {
            options = {};
        }
        if (!options.url) {
            options.url = [options.controller || 'index',
                           options.action || 'index'].join('/');
            delete options.controller;
            delete options.action;
        }
        if (!options.data) {
            options.data = {};
        }

        var oldCallbacks = _.pick(options, 'success', 'error');

        var callbacks = {
            success: function (resp, textStatus, jqXHR) {
                if (!oldCallbacks.success || oldCallbacks.success(resp, textStatus, jqXHR) !== false) {
                    console.log(options.url, resp);
                }
            }.bind(this),
            error  : function (jqXHR, status, errorThrown) {
                if (!oldCallbacks.error || oldCallbacks.error(jqXHR, status, errorThrown) !== false) {
                    this.trigger('error', jqXHR, status, errorThrown);
                }
            }.bind(this)
        };

        _.extend(options, callbacks);

        options.data.now = moment().unix();
        // if( !options.headers){
        //     options.headers = {};
        // };
        
        // _.extend(options.headers, {'X-Version': window.config.version, 'X-Now': moment().unix()});
        
        return Backbone.ajax.call(this, options);
    };

    return Model;
});