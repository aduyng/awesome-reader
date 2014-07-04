var db = require('../db'),
    Super = require('./base'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    Role = require('./role'),
    User = require('./user'),
    StoreUserRole = require('./store-user-role'),
    TicketCollection = require('../collections/ticket'),
    ProductCategory = require('./product-category'),
    Model = Super.extend({
                             tableName : 'Store',
                             categories: function () {
                                 return this.hasMany(ProductCategory, 'storeId');
                             }
                         });

Model.incomeOfUsers = function (storeId, start, end, excludedTicketId) {
    var query = TicketCollection
        .forge()
        .query()
        .column('Ticket.technicianId',
                db.knex.raw('SUM("Ticket"."amount") as income'),
                db.knex.raw('SUM("Ticket"."turnIncreasedBy") as turns'))
        .whereBetween('Ticket.dateCreated', [start, end])
        .where('Ticket.storeId', storeId)
        .groupBy('Ticket.technicianId');

    if (excludedTicketId) {
        query.where('Ticket.id', '<>', excludedTicketId);
    }
    
    return query.select();
};

Object.defineProperty(Model.prototype, "turnThresholdAmount", {
    get: function(){
        var v = this.get("turnThresholdAmount");
        if( !_.isNumber(v)){
            v = parseFloat(v);
            this.set("turnThresholdAmount", v);
        }
        return v;
    },
    set: function(v){
        this.set("turnThresholdAmount", v);
        return this;
    }
    
});

module.exports = Model;
