define(function(require) {
    var Super = require('./base');

    var Model = Super.extend({
        urlRoot: '/feed'
    });

    return Model;
});