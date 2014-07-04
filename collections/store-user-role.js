var Super = require('./base'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    Role = require('../models/role'),
    Model = require('../models/store-user-role'),
    StoreUserRole = Model;

var Collection = Super.extend({
                                  model: Model
                              });


module.exports = Collection;
