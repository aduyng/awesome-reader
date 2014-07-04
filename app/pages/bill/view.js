define(function(require) {
    var Super = require('views/page'),
        Template = require('hbs!./view.tpl'),
        Action = require('models/action'),
        Role = require('models/role'),
        Bill = require('models/bill'),
        Workflow = require('models/workflow'),
        SelectTicketsView = require('./view/select-tickets'),
        EditView = require('./view/edit'),
        Promise = require('bluebird');


    var Page = Super.extend({});


    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.workflow = new Workflow({
            id: 2
        });

    };

    Page.prototype.render = function() {
        Promise.resolve(this.workflow.load(this.options.params.id)).then(function() {
            //if there is no id, then reload the page with action/select-technician 
            if (!this.params.id || this.params.action == 'select-tickets') {
                return this.renderSelectTicketsView();
            }

            return this.renderEditView();
        }.bind(this)).then(this.ready.bind(this));
        var events = {};
        events['click #' + this.getId('back')] = 'backButtonClickHandler';
        this.delegateEvents(events);

    };

    Page.prototype.renderSelectTicketsView = function() {
        return Promise.resolve().then(function() {
            if (this.options.params.id) {
                return this.workflow.process(Action.VIEW, this.options.params.id).then(function(resp) {
                    return new Bill(resp[0]);
                }.bind(this));

            }
            return new Bill();
        }.bind(this)).then(function(bill) {

            this.$el.html(Template({
                id: this.getId(),
                bill: bill.toJSON(),
                selectTickets: true
            }));

            this.mapControls();


            this.controls.ui = new SelectTicketsView(_.extend({}, this.options, {
                el: this.controls.selectTickets,
                container: this,
                bill: bill
            }));

            this.controls.ui.on('saved', function(resp) {
                var bill = new Bill(resp[0]);

                this.reload({
                    action: 'edit',
                    id: bill.id
                });

            }, this);

            return this.controls.ui.render();
        }.bind(this));
    };


    Page.prototype.renderEditView = function() {
        //make sure that the user can view the ticket first
        if (!this.workflow.rules.getByActionId(Action.VIEW)) {
            this.toast.error("Bill does not exist or you don't have permission to view it!");
            return Promise.reject();
        };

        return Promise.resolve().then(function() {
            return this.workflow.process(Action.VIEW, this.options.params.id);
        }.bind(this)).then(function(resp) {
            var bill = new Bill(resp[0]);

            this.$el.html(Template({
                id: this.getId(),
                editView: true,
                bill: bill
            }));

            this.mapControls();


            this.controls.ui = new EditView(_.extend({}, this.options, {
                el: this.controls.editView,
                container: this,
                bill: bill
            }));

            return this.controls.ui.render();

        }.bind(this));
    };



    return Page;


});