define(function(require){
    var Super = require('./base');

    var Model = Super.extend({
        urlRoot: '/rest/role'
    });
    Model.OWNER = 1;
    Model.TECHNICIAN = 2;
    return Model;
});