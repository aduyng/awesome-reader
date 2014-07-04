define(function(require) {
    var Super = require('./base');

    var Model = Super.extend({
        urlRoot: '/user'
    });



    return Model;
});