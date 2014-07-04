/*global Ladda, NProgress*/

define(function(require) {
    var _ = require('underscore'),
        Super = require('views/page'),
        moment = require('moment'),
        Promise = require('bluebird'),
        Workflow = require('models/workflow'),
        Action = require('models/action'),
        Bill = require('models/bill'),
        TicketCollection = require('collections/ticket'),
        Template = require('hbs!./select-tickets.tpl');

    var Page = Super.extend({});


    Page.prototype.initialize = function(options) {
        //TODO: uncheckout the ticket that are removed from a bill.

        //super(options)
        Super.prototype.initialize.call(this, options);
        this.container = options.container;
        this.workflow = options.container.workflow;
        this.bill = options.bill;
        this.tickets = new TicketCollection();
        this.tickets.comparator = function(model) {
            return model.technician.name;
        };
    };

    Page.prototype.render = function() {
        return this.workflow.process(Action.GET_PENDING_TICKETS, this.bill.id).then(function(results) {
            this.tickets.reset(results[0]);

            var params = {
                id: this.id,
                items: this.tickets.map(function(ticket) {
                    return _.extend(ticket.toJSON(), {
                        technician: ticket.technician,
                        selected: this.bill.tickets.get(ticket.id) !== undefined
                    });
                }, this)
            };

            this.$el.html(Template(params));
            this.mapControls();


            var events = {};

            events['click .' + this.getId('btn-ticket')] = 'ticketButtonClickHandler';
            events['click #' + this.getId('next')] = 'nextButtonClickHandler';

            this.delegateEvents(events);

            this.ready();
        }.bind(this));


    };

    Page.prototype.ticketButtonClickHandler = function(event) {
        event.preventDefault();

        var e = $(event.currentTarget);
        e.toggleClass('btn-success');

        //TODO: prevent to select more than one ticket for one technician in one ticket        

    };


    Page.prototype.nextButtonClickHandler = function(event) {
        event.preventDefault();
        var selectedButtons = this.$el.find('.' + this.getId('btn-ticket.btn-success'));
        var ids = [],duplicatedTechnicianTicketId,
            technicianIds = {}, duplicatedTechnicianId, billId = this.options.params.id;

        //search for all button that has btn-success
        _.forEach(selectedButtons, function(button) {
            var b = $(button);
            var technicianId = parseInt(b.data('technician-id'), 10);
            ids.push(b.data('id'));

            if (technicianIds[technicianId]) {
                duplicatedTechnicianId = technicianId;
                duplicatedTechnicianTicketId = b.data('id');
                return false;
            }
            technicianIds[technicianId] = true;

        });

        if (_.isEmpty(ids)) {
            this.toast.error('You must select at least one tickets!');
            return;
        }

        if (duplicatedTechnicianId) {
            var user = this.tickets.get(duplicatedTechnicianTicketId).technician;
            this.toast.error('There is only one ticket per technician in a bill. Technician ' + (user ? user.name : duplicatedTechnicianId) + ' has more than one tickets!');
            return;
        }

        var workflow = new Workflow({
            id: 1 //ticket workflow id
        });

        var ticketIdsTobeRemoved = _.difference(this.bill.tickets.pluck('id'), ids);
        var ticketIdsTobeAdded = this.bill.tickets.reduce(function(memo, ticket) {
            return _.without(memo, ticket.id);
        }, ids, this);



        var l = Ladda.create(event.currentTarget);
        l.start();
        NProgress.start();
        return Promise.resolve().then(function() {
            NProgress.inc();
            if (this.bill.isNew()) {
                //create the bill first
                return this.workflow.process(Action.CREATE).then(function(resp) {
                    NProgress.inc();
                    if (!resp || resp.length === 0) {
                        return Promise.reject('Unable to create the bill!');
                    }

                    this.bill.set(resp[0]);
                }.bind(this));
            }
        }.bind(this)).then(function() {
            //process removing ticketIdsTobeRemoved
            if (ticketIdsTobeRemoved.length > 0) {
                NProgress.inc();
                return Promise.all(_.map(ticketIdsTobeRemoved, function(ticketId) {
                    return workflow.process(Action.UNCHECKOUT, ticketId, {
                        billId: this.bill.id
                    }, true).then(function() {
                        NProgress.inc();
                    });
                }, this));
            }
        }.bind(this)).then(function() {
            //process removing ticketIdsTobeRemoved
            if (ticketIdsTobeAdded.length > 0) {
                NProgress.inc();
                return Promise.all(_.map(ticketIdsTobeAdded, function(ticketId) {
                    return workflow.process(Action.CHECKOUT, ticketId, {
                        billId: this.bill.id
                    }, true).then(function() {
                        NProgress.inc();
                    });
                }, this));
            }

        }.bind(this)).then(function() {
            return this.workflow.process(Action.UPDATE_TICKETS, this.bill.id, {
                ticketIds: ids
            }, true);
        }.bind(this)).then(function(resp) {
            NProgress.inc();
            this.trigger('saved', resp);
        }.bind(this)).
        catch (function(e) {
            console.log("an error happened", e);
        }.bind(this)).
        finally(function() {
            l.stop();
            NProgress.done();
        });


    };

    return Page;


});