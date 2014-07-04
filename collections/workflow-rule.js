var db                          = require('../db'),
    _                           = require('underscore'),
    Promise                     = require('bluebird'),
    WorkflowMethodCollection    = require('../collections/workflow-method'),
    Model                       = require('../models/workflow-rule');

var Collection = db.Collection.extend({
                                          model: Model
                                      });

Collection.prototype.getMethods = function () {
    if (this.methods) {
        return Promise.resolve(this.methods);
    }
    if (this.length === 0) {
        return Promise.resolve();
    }

    var ids = _.uniq(this.pluck('methodId'));

    return WorkflowMethodCollection.forge()
        .query(function (qb) {
                   qb.whereIn('id', ids);
               })
        .fetch()
        .then(function (docs) {
                  this.methods = docs;
                  return this.methods;
              }.bind(this));
};

module.exports = Collection;
