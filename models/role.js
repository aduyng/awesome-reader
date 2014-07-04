var db = require('../db');

var Model = db.Model.extend({
                                tableName: 'Role'
                            });

Model.UNAUTHENTICATED_USER = 4;
Model.AUTHENTICATED_USER = 3;

Model.OWNER = 1;
Model.TECHNICIAN = 2;
Model.OTHER_TECHNICIAN = 3;


module.exports = Model;