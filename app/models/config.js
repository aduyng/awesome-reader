define(function (require) {
    
    var Super = require('./base');

    var Config = Super.extend({
                                  defaults: {
                                      baseUrl   : window.location.origin,
                                      apiBaseUrl: [window.location.origin, 'api'].join('/')
                                  }
                              });

    Object.defineProperty(Config.prototype, 'baseUrl', {
        get: function () {
            return this.get('baseUrl');
        }
    });

    Object.defineProperty(Config.prototype, 'apiBaseUrl', {
        get: function () {
            return this.get('apiBaseUrl');
        }
    });

    Object.defineProperty(Config.prototype, 'name', {
        get: function () {
            return this.get('name');
        }
    });
    
    Object.defineProperty(Config.prototype, 'version', {
        get: function () {
            return this.get('version');
        }
    });
    
    return Config;
});