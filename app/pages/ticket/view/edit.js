/*global NProgress, Ladda*/

define(function(require) {
    var Super = require('views/page'),
        _ = require('underscore'),
        moment = require('moment'),
        Promise = require('bluebird'),
        accounting = require('accounting'),
        Ticket = require('models/ticket'),
        Action = require('models/action'),
        User = require('models/user'),
        Workflow = require('models/workflow'),
        TicketStatus = require('models/ticket-status'),
        TaskCollection = require('collections/task'),
        Template = require('hbs!./edit.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.ticket = options.ticket;
        this.tasks = this.ticket.tasks;
        this.products = window.app.ds.products;
        this.workflow = options.container.workflow;

        this.isAllowedToViewTechnicianInfo = this.workflow.rules.getByActionId(Action.VIEW_TICKET_TECHNICIAN_INFO);
        this.isAllowedToEditTechnicianInfo = this.workflow.rules.getByActionId(Action.UPDATE_TICKET_TECHNICIAN_INFO);
        this.isTechnicianChangeable = this.workflow.rules.getByActionId(Action.CHANGE_TECHNICIAN);
        this.isTicketPriceChangable = this.workflow.rules.getByActionId(Action.CHANGE_TICKET_PRICE);
        this.isEditable = this.workflow.rules.getByActionId(Action.EDIT);
        this.isDeletable = this.workflow.rules.getByActionId(Action.DELETE);
        this.isCheckoutable = this.workflow.rules.getByActionId(Action.CHECKOUT);
        this.isDateChangeable = this.isEditable && this.session.isOwner;
    };


    Page.prototype.render = function() {
        var params = {
            id: this.id,
            ticket: _.extend(this.ticket.toJSON(), {
                technician: this.ticket.technician
            }),
            start: moment.unix(this.ticket.dateCreated).startOf('day').unix(),
            end: moment.unix(this.ticket.dateCreated).endOf('day').unix(),
            tasks: this.tasks.map(function(task) {
                var product = this.products.get(task.productId);
                var category = product.category;
                console.log(category.toJSON());
                return _.extend(task.toJSON(), {
                    product: product,
                    category: category
                });
            }.bind(this)),
            isAllowedToEditTechnicianInfo: this.isAllowedToEditTechnicianInfo,
            isAllowedToViewTechnicianInfo: this.isAllowedToViewTechnicianInfo,
            isTechnicianChangeable: this.isTechnicianChangeable,
            isTicketPriceChangable: this.isTicketPriceChangable,
            isEditable: this.isEditable,
            isDeletable: this.isDeletable,
            isCheckoutable: this.isCheckoutable,
            isDateChangeable: this.isDateChangeable
        };

        this.$el.html(Template(params));

        this.mapControls();

        if (this.isAllowedToViewTechnicianInfo) {
            if (this.isEditable) {
                if (this.isAllowedToEditTechnicianInfo) {
                    this.controls.turnIncreasedBy.TouchSpin();
                    this.controls.commissionRatio.TouchSpin();
                    this.controls.tipDivisionRatio.TouchSpin();

                    //create a switch
                    this.controls.technicianInfoSwitch.bootstrapSwitch();

                }
            }
        }
        if (this.isEditable) {
            if (this.isTicketPriceChangable) {
                this.$el.find('.' + this.getId('price')).TouchSpin();
            }
        }

        var events = {};

        if (this.isEditable) {
            if (this.isTicketPriceChangable) {
                events['change .' + this.getId('price')] = 'priceChangeHandler';
            }
        }

        if (this.isAllowedToViewTechnicianInfo) {
            this.controls.technicianInfoSwitch.on('switchChange.bootstrapSwitch', this.technicianSwitchHandler.bind(this));

            if (this.isEditable) {
                events['change .' + this.getId('technician-info')] = 'technicianInfoChangeHandler';
            }
        }

        if (this.isEditable) {
            events['change .' + this.getId('date-created')] = 'dateCreatedChangeHandler';
        }

        if (this.isDeletable) {
            this.controls.delete.bootstrapConfirmButton({
                sure: this.deleteButtonClickHandler.bind(this)
            });
        }

        if (this.isCheckoutable) {
            events['click #' + this.getId('checkout')] = 'checkoutButtonClickHandler';
        }

        this.delegateEvents(events);
        this.on('save', this.save.bind(this));

        this.ready();
    };

    Page.prototype.technicianSwitchHandler = function() {
        _.defer(function() {
            if (this.controls.technicianInfoSwitch.is(':checked')) {
                this.controls.technicianBody.removeClass('hide');
            }
            else {
                this.controls.technicianBody.addClass('hide');
            }
        }.bind(this));
    };

    Page.prototype.dateCreatedChangeHandler = _.debounce(function(event) {
        this.trigger('save');

    }, 300);

    Page.prototype.technicianInfoChangeHandler = _.debounce(function(event) {
        var params = {
            turnIncreasedBy: this.controls.turnIncreasedBy.val(),
            commissionRatio: this.controls.commissionRatio.val(),
            tipDivisionRatio: this.controls.tipDivisionRatio.val()
        };

        NProgress.start();
        Promise.resolve(this.workflow.process(Action.UPDATE_TICKET_TECHNICIAN_INFO, this.options.params.id, params)).
        finally(function() {
            NProgress.done();
        }.bind(this));
    }, 300);

    Page.prototype.priceChangeHandler = function() {
        //update the total
        this.controls.amount.text(accounting.formatMoney(_.reduce(this.$el.find('.' + this.getId('price')), function(memo, element) {
            var e = $(element);
            return memo + (parseFloat(e.val()) || 0);
        }, 0), '$', 0));

        this.updateTasks();
    };


    Page.prototype.updateTasks = _.debounce(function(event) {
        var params = {
            tasks: _.map(this.$el.find('.' + this.getId('price')), function(element) {
                var e = $(element);
                return {
                    id: $(element).data('id'),
                    price: e.val()
                };
            }, this)
        };


        NProgress.start();
        Promise.resolve(this.workflow.process(Action.CHANGE_TICKET_PRICE, this.options.params.id, params)).
        finally(function() {
            NProgress.done();
        }.bind(this));

    }, 300);

    Page.prototype.save = function(event) {
        var params = {
        };
        
        if( this.isDateChangeable ){
            params.dateCreated = moment(this.controls.dateCreated.val() + ' ' + this.controls.timeCreated.val()).unix();
        }else{
            params.dateCreated = this.ticket.dateCreated;
        }

        NProgress.start();
        Promise.resolve(this.workflow.process(Action.EDIT, this.options.params.id, params)).
        finally(function() {
            NProgress.done();
        }.bind(this));
    };


    Page.prototype.checkoutButtonClickHandler = function(event) {
        var billId;
        
        var workflow = new Workflow({
            id: 2 //bill workflow id
        });
        
        var l = Ladda.create(event.currentTarget);
        l.start();
        NProgress.start();
        
        Promise.resolve(workflow.load()).then(function() {
            NProgress.inc();
            //create the bill first
            return workflow.process(Action.CREATE);
        }.bind(this)).then(function(resp) {
            NProgress.inc();
        
            if (!resp || resp.length === 0) {
                return Promise.reject('Unable to create the bill!');
            }
            
            billId = resp[0].id;

             return Promise.all([
                this.workflow.process(Action.CHECKOUT, this.options.params.id, {billId: billId}),  //check out the ticket
                workflow.process(Action.UPDATE_TICKETS, billId, {ticketIds: [this.ticket.id]}, true) //update the ticket to the bill
            ]);
            
        }.bind(this))
        .then(function() {
            NProgress.inc();
            this.toast.success('Ticket has been checked out to a bill.');
            this.goTo('bill/view/id/' + billId);
        }.bind(this)).
        finally(function() {
            l.stop();
            NProgress.done();
        }.bind(this));

    };


    Page.prototype.deleteButtonClickHandler = function(event) {
        var params = {};

        NProgress.start();
        Promise.resolve(this.workflow.process(Action.DELETE, this.options.params.id, params))
        .finally(function() {
            this.back();
        }.bind(this));
    };


    return Page;


});