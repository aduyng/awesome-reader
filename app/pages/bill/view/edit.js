/*global _, NProgress, Ladda*/
define(function(require) {
    var Super = require('views/page'),
        accounting = require('accounting'),
        Bill = require('models/bill'),
        moment = require('moment'),
        Promise = require('bluebird'),
        BillStatus = require('models/bill-status'),
        TaskCollection = require('collections/ticket'),
        Workflow = require('models/workflow'),
        Action = require('models/action'),
        Template = require('hbs!./edit.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.bill = options.bill;
        this.tickets = this.bill.tickets;
        this.paymentCategories = window.app.ds.paymentCategories;
        this.payments = this.bill.payments;

        this.workflow = options.container.workflow;

        this.isEditable = this.workflow.rules.getByActionId(Action.EDIT);
        this.isDeletable = this.workflow.rules.getByActionId(Action.DELETE);
        this.isCheckoutable = this.workflow.rules.getByActionId(Action.CHECKOUT);
        this.isDateChangeable = this.isEditable && this.session.isOwner;
        this.isVoidable = this.workflow.rules.getByActionId(Action.VOID);
    };

    Page.prototype.render = function() {
        var total = this.calculateRequiredAmount();

        var params = {
            id: this.id,
            bill: _.extend(this.bill.toJSON(), {
                customer: this.bill.customer
            }),
            tickets: this.tickets.map(function(ticket) {
                return _.extend(ticket.toJSON(), {
                    proposedTip: total > 0 ? Math.floor(parseFloat(ticket.get('amount')) * parseFloat(this.bill.get('tip')) / total) : 0,
                    technician: ticket.technician
                });
            }, this),
            payments: this.paymentCategories.map(function(pc) {
                var payment = this.payments.find(function(p) {
                    return pc.id == p.get('paymentCategoryId');
                }, this);
                return _.extend(pc.toJSON(), {
                    amount: payment ? payment.get('amount') : 0
                });
            }, this),
            isEditable: this.isEditable,
            isCheckoutable: this.isCheckoutable,
            isDeletable: this.isDeletable,
            isDateChangeable: this.isDateChangeable,
            isVoidable: this.isVoidable
        };

        this.$el.html(Template(params));
        this.mapControls();

        // this.controls.delete.bootstrapConfirmButton({
        //     sure: this.deleteButtonClickHandler.bind(this)
        // });

        // this.adjustDeleteButton();
        // this.adjustCheckoutButton();

        

        if (this.tickets.length > 0) {
            this.updatePaymentStatus();
            this.updateTipPanelStatus();
        }
        if (this.isEditable) {  
            this.$el.find('.' + this.getId('payment')).TouchSpin();
            this.$el.find('.' + this.getId('tip')).TouchSpin();
            this.$el.find('#' + this.getId('tip')).TouchSpin();
        }

        var events = {};

        // events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';
        // events['click #' + this.controls.save.attr('id')] = 'saveButtonClickHandler';
        // events['click #' + this.controls.checkout.attr('id')] = 'saveButtonClickHandler';
        if (this.isEditable) {
            events['change .' + this.getId('payment')] = 'paymentChangeHandler';
            events['click .' + this.getId('payment-group') + ' .bootstrap-touchspin-postfix'] = 'paymentInputClickHandler';
            events['click .' + this.getId('tip-group') + ' .bootstrap-touchspin-postfix'] = 'tipInputClickHandler';
            events['click .' + this.getId('tip-group') + ' .bootstrap-touchspin-prefix'] = 'tipInputRemainingClickHandler';
            events['change #' + this.getId('tip')] = 'tipChangeHandler';
            events['change .' + this.getId('tip')] = 'individualTipChangeHandler';
            events['change .' + this.getId('date-created')] = 'dateCreatedChangeHandler';
            this.on('save', this.save.bind(this));
        }
        if( this.isCheckoutable ){
            events['click ' + this.toId('checkout')] = 'checkoutButtonClickHandler';
            this.adjustCheckoutButton();
        }
        
        if (this.isDeletable) {
            this.controls.delete.bootstrapConfirmButton({
                sure: this.deleteButtonClickHandler.bind(this)
            });
        }
        
        if (this.isVoidable) {
            this.controls.void.bootstrapConfirmButton({
                sure: this.voidButtonClickHandler.bind(this)
            });
        }

        this.delegateEvents(events);

        this.ready();
    };
    
    Page.prototype.dateCreatedChangeHandler = _.debounce(function(event) {
        this.trigger('save');
    }, 300);
    

    Page.prototype.save = function(showWaitingIndicator){
        if( showWaitingIndicator ){
            NProgress.start();
        }
        return Promise.resolve().then(function(){
            var params = {
                tip: parseFloat(this.controls.tip.val()),
                
                payments: _.map(this.findByClass('payment'), function(element){
                    var e = $(element);
                    return {paymentCategoryId: e.data('id'), amount: parseFloat(e.val()) || 0};
                }, this)
            };
            
            if( this.isDateChangeable ){
                params.dateCreated = moment(this.controls.dateCreated.val() + ' ' + this.controls.timeCreated.val()).unix() || 0;
            }
            
            return this.workflow.process(Action.EDIT, this.bill.id, params);
        }.bind(this)).finally(function(){
            if( showWaitingIndicator ){
                NProgress.done();
            }
        });
            
    };

    Page.prototype.saveDividedTip = function(ticketId, showWaitingIndicator){
        if( showWaitingIndicator ){
            NProgress.start();
        }
        //save  the main tip and divided tips
        return Promise.resolve().then(function() {
            var workflow = new Workflow({
                id: 1 //ticket workflow id
            });
            
            var e = this.findById('tip-' + ticketId);

            return workflow.process(Action.UPDATE_TIP, ticketId, {
                tip: parseFloat(e.val())
            }, true);
        }.bind(this))
        .finally(function(){
            if( showWaitingIndicator ){
                NProgress.done();
            }
        });
    };
    
    Page.prototype.tipChangeHandler = _.debounce(function(event) {
        
        //if there is only one ticket, then assign the whole tip amount for that ticket
        if (this.tickets.length == 1) {
            this.$el.find('.' + this.getId('tip')).val(parseFloat(this.controls.tip.val()) || 0);
        }
        this.updatePaymentStatus();
        this.updateTipPanelStatus();
        
        //save  the main tip and divided tips
        NProgress.start();
        return Promise.resolve().then(function() {
            NProgress.inc();
            return this.save();
        }.bind(this))
        .then(function() {
            NProgress.inc();
            return Promise.all(_.map(this.$el.find('.' + this.getId('tip')), function(element) {
                return this.saveDividedTip( $(element).data('id'));
            }, this));
        }.bind(this))
        .finally(function(){
            NProgress.done();
        });
    },300);

    /**
     * show the tip distribution panel when the tip amount is > 0
     */
    Page.prototype.updateTipPanelStatus = function() {
        if( this.bill.stateId != BillStatus.PENDING ){
            if( this.bill.tip > 0){
                this.controls.tipDistributionPanel.removeClass('hide');
                this.updateTipStatus();
            }
            return ;
        }
        var tip = parseFloat(this.controls.tip.val()) || 0;
        
        var total = this.calculateRequiredAmount();

        if (tip > 0) {
            //recalculate the proposed tip amount for each ticket
            _.forEach(this.$el.find('.' + this.getId('proposed-tip')), function(element) {
                var e = $(element);
                var ticket = this.tickets.get(e.data('id'));
                var proposed = Math.floor(total > 0 ? (ticket.amount * tip) / (total - tip) : 0);
                e.text(accounting.formatMoney(proposed, '$', 0));
            }, this);

            this.controls.tipDistributionPanel.removeClass('hide');
            this.updateTipStatus();
            this.adjustCheckoutButton();
        }
        else {
            this.controls.tipDistributionPanel.addClass('hide');
        }
    };
    /**
     * update the tip distribution panel to show the remaining amount when entering individual tip amount
     */
    Page.prototype.updateTipStatus = function() {
        
        if( this.bill.stateId != BillStatus.PENDING ){
            return ;
        }
        var required = parseFloat(this.controls.tip.val()) || 0;
        
        

        var sum = _.reduce(this.$el.find('.' + this.getId('tip')), function(memo, element) {
            var e = $(element);
            return memo + (parseFloat(e.val()) || 0);
        }, 0, this);

        var diff = required - sum;
        if (diff != 0) {
            this.controls.tipDistributionPanel.addClass('panel-danger');
            this.controls.tipRemaining.text(accounting.formatMoney(diff, '$', 0));
        }
        else {
            this.controls.tipRemaining.text('');
            this.controls.tipDistributionPanel.removeClass('panel-danger');
        }
    };
    /**
     * handling the click on the auto-fill button on the right of tip input
     * @param event
     */
    Page.prototype.tipInputClickHandler =  _.debounce(function(event) {
        var id = $(event.currentTarget).closest('.form-group').find('.' + this.getId('tip')).data('id');
        this.autoFillTip(id);
        this.saveDividedTip(id, true);
    }, 300);
    /**
     * handling the click on the auto-fill remaining tip button on the left of tip input
     * @param event
     */
    Page.prototype.tipInputRemainingClickHandler = _.debounce(function(event) {
        var id = $(event.currentTarget).closest('.form-group').find('.' + this.getId('tip')).data('id');
        this.autoFillTip(id, true);
        this.saveDividedTip(id, true);
    }, 300);

    /**
     * auto calculate the remaining amount of the tip excluding the current input and fill that value into the input
     * @param id
     */
    Page.prototype.autoFillTip = function(id, useRemaining) {
        //calculate the required amount
        var required = parseFloat(this.controls.tip.val()) || 0;
        if (required > 0) {
            //select the current input
            var input = this.$el.find('#' + this.getId('tip-' + id));

            var tip = parseFloat(this.controls.tip.val()) || 0;
            var proposed;

            if (useRemaining) {
                var sum = _.reduce(this.$el.find('.' + this.getId('tip')), function(memo, element) {
                    var e = $(element);
                    if( $(e).data('id') == id){
                        return memo;
                    }
                    return memo + (parseFloat(e.val()) || 0);
                }, 0, this);
                proposed = required - sum;
            }
            else {
                var total = this.calculateRequiredAmount();
                var ticket = this.tickets.get(id);
                proposed = Math.floor(total > 0 ? parseFloat(ticket.get('amount')) * tip / (total - tip) : 0);
            }

            input.val(proposed);

            this.updateTipStatus();
            this.adjustCheckoutButton();
        }
    };
    Page.prototype.checkoutButtonClickHandler = function(event) {
        var self = this;
        var workflow = new Workflow({
            id: 1 //ticket workflow id
        });
        
        NProgress.start();
        var l = Ladda.create(event.currentTarget);
        l.start();
        return Promise.resolve()
            .then(function() {
                //check out all tickets
                return Promise.all(self.bill.tickets.map(function(ticket){
                    return workflow.process(Action.CHECKOUT, ticket.id, {}, true);
                }.bind(this)));
            }.bind(this))
            .then(function() {
                return self.workflow.process(Action.CHECKOUT, self.bill.id);
            }.bind(this))
            .then(function(){
                self.toast.success('Bill has been checked out successfully.');
                self.goTo('bill/index');
            }.bind(this))
            .finally(function() {
                NProgress.done();
                l.stop();
            });
    };


    /**
     * individual tip change handler
     * @param event
     */
    Page.prototype.individualTipChangeHandler = _.debounce(function(event) {
        var id = $(event.currentTarget).data('id');
        
        this.updateTipStatus();
        this.adjustCheckoutButton();
        this.saveDividedTip(id, true);
    }, 300);

    /**
     * handling the click on the button to the right of the the payment input
     * @param event
     */
    Page.prototype.paymentInputClickHandler = _.debounce(function(event) {
        var id = $(event.currentTarget).closest('.form-group').find('.' + this.getId('payment')).data('id');
        this.autoFillPayment(id);
        this.save(true);
    }, 300);

    Page.prototype.autoFillPayment = function(id) {

        //calculate the required amount
        var required = this.calculateRequiredAmount();

        //select the current input
        var input = this.$el.find('#' + this.getId('payment-' + id));

        //calculate the sum without the current input
        var sum = _.reduce(this.$el.find('.' + this.getId('payment')), function(memo, element) {
            var e = $(element);
            if (e.data('id') != id) {
                return memo + (parseFloat(e.val()) || 0);
            }
            return memo;
        }, 0, this);
        var diff = required - sum;
        if (diff > 0) {
            input.val(diff);
            this.updatePaymentStatus();
            this.adjustCheckoutButton();
        }
    };


    Page.prototype.paymentChangeHandler = _.debounce(function(event) {
        this.updatePaymentStatus();
        this.adjustCheckoutButton();
        this.save(true);
    }, 300);


    Page.prototype.calculateRequiredAmount = function() {
        var amount = this.tickets.reduce(function(memo, ticket) {
            return memo + (parseFloat(ticket.get('amount')) || 0);
        }, 0, this);
        if (this.controls.tip) {
            amount += (parseFloat(this.controls.tip.val()) || 0);
        }
        else {
            amount += this.bill.tip;
        }
        return amount;
    };

    Page.prototype.adjustDeleteButton = function() {
        this.controls.delete.removeAttr('disabled');
    };

    Page.prototype.adjustCheckoutButton = function() {
        if( !this.isCheckoutable  ){
            return;
        }
        
        var hasError = this.bill.tickets.length === 0;
        if( !hasError ){
            var requiredAmount = this.calculateRequiredAmount();
    
            var sum = _.reduce(this.$el.find('.' + this.getId('payment')), function(memo, element) {
                var e = $(element);
                return memo + (parseFloat(e.val()) || 0);
            }, 0, this);
            var diff = requiredAmount - sum;
    
            if (diff !== 0) {
                hasError = true;
            }
        }
        
        if (!hasError) {
            var requiredTip = parseFloat(this.controls.tip.val()) || 0;
            if (requiredTip > 0) {

                //calculate the sum without the current input
                var totalTip = _.reduce(this.$el.find('.' + this.getId('tip')), function(memo, element) {
                    var e = $(element);
                    return memo + (parseFloat(e.val()) || 0);
                }, 0, this);
                diff = requiredTip - totalTip;
                if (diff != 0) {
                    hasError = true;
                }
            }
        }

        if (!hasError) {
            this.controls.checkout.removeAttr('disabled');
        }
        else {
            this.controls.checkout.attr('disabled', 'disabled');
        }
    };

    Page.prototype.updatePaymentStatus = function() {
        if( this.bill.stateId != BillStatus.PENDING){
            this.controls.paymentPanel.removeClass('panel-danger');
            return;
        }
        
        var required = this.calculateRequiredAmount();

        var sum = _.reduce(this.$el.find('.' + this.getId('payment')), function(memo, element) {
            var e = $(element);
            return memo + (parseFloat(e.val()) || 0);
        }, 0, this);

        var diff = required - sum;
        
        if (diff != 0) {
            this.controls.paymentPanel.addClass('panel-danger');
            this.controls.paymentRemaining.text(accounting.formatMoney(diff, '$', 0));
        }
        else {
            this.controls.paymentRemaining.text('');
            this.controls.paymentPanel.removeClass('panel-danger');
        }


    };


    Page.prototype.saveButtonClickHandler = function(event) {
        event.preventDefault();
        this.save(event);
    };

    Page.prototype.serialize = function() {
        var data = _.extend(Super.prototype.serialize.call(this), {
            id: this.bill.id,
            payments: _.map(this.$el.find('.' + this.getId('payment')), function(element) {
                var e = $(element);
                return {
                    paymentCategoryId: e.data('id'),
                    amount: parseFloat(e.val())
                };
            }, this),
            tickets: this.tickets.map(function(ticket) {
                return {
                    id: ticket.id,
                    tip: parseFloat(this.$el.find('#' + this.getId('tip-' + ticket.id)).val())
                };
            }, this)

        });
        return data;

    };
    Page.prototype.voidButtonClickHandler = function(event) {
        var workflow = new Workflow({
            id: 1 //ticket workflow id
        });

        NProgress.start();
        
        Promise.resolve()
            .then(function(){
                NProgress.inc();
                return Promise.all(this.bill.tickets.map(function(ticket) {
                    console.log(ticket);
                    return workflow.process(Action.UNCHECKOUT, ticket.id, {
                        billId: this.bill.id
                    }, true).then(function() {
                        NProgress.inc();
                    });
                }, this));
            }.bind(this))    
            .then(function(){
                NProgress.inc();
                return this.workflow.process(Action.VOID, this.bill.id, {});
            }.bind(this))
            .then(function(){
                this.goTo('bill/index');
            }.bind(this))
            .catch(function(e){
                this.toast.error('Unable to void this bill. Please contact support!');
                console.log(e);
            }.bind(this))
            .finally(function() {
                NProgress.done();
            }.bind(this));
    };

    Page.prototype.deleteButtonClickHandler = function(event) {
        var workflow = new Workflow({
            id: 1 //ticket workflow id
        });

        NProgress.start();
        
        Promise.resolve()
            .then(function(){
                NProgress.inc();
                return Promise.all(this.bill.tickets.map(function(ticket) {
                    console.log(ticket);
                    return workflow.process(Action.UNCHECKOUT, ticket.id, {
                        billId: this.bill.id
                    }, true).then(function() {
                        NProgress.inc();
                    });
                }, this));
            }.bind(this))    
            .then(function(){
                NProgress.inc();
                return this.workflow.process(Action.DELETE, this.bill.id, {});
            }.bind(this))
            .then(function(){
                this.goTo('bill/index');
            }.bind(this))
            .catch(function(e){
                this.toast.error('Unable to delete this bill. Please contact support!');
                console.log(e);
            }.bind(this))
            .finally(function() {
                NProgress.done();
            }.bind(this));
    };


    return Page;


});