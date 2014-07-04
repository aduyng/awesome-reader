var RoleCollection = require('../collections/role'),
    Role = require('../models/role'),
    _ = require('underscore'),
    _s = require('underscore.string');

exports.roleList = function (req, res, next) {
    RoleCollection.forge()
        .fetch()
        .then(function (rows) {
            if (!rows) {
                res.send(500);
                return;
            }
            res.send(200, rows.map(function(row){
                return row.toJSON();
            }));
        });
};
