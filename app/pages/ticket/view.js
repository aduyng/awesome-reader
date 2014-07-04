define(function(require) {
    var Super = require('views/page'),
        Template = require('hbs!./view.tpl'),
        Action = require('models/action'),
        Role = require('models/role'),
        Ticket = require('models/ticket'),
        Workflow = require('models/workflow'),
        SelectTechnicianView = require('./view/select-technician'),
        SelectServicesView = require('./view/select-services'),
        EditView = require('./view/edit'),
        Promise = require('bluebird');


    var Page = Super.extend({});


    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.workflow = new Workflow({
            id: 1
        });

    };

    Page.prototype.render = function() {

        //there is no id and the user is the technician, then create a ticket and redirect him to the new ticket
        if (!this.options.params.id && this.session.roleId == Role.TECHNICIAN) {
            return Promise.resolve(this.workflow.load()).then(function() {
                var data = {
                    technicianId: this.session.userId
                };
                return Promise.resolve(this.workflow.process(Action.CREATE, null, data));
            }.bind(this)).then(function(resp) {
                this.reload({
                    action: 'select-services',
                    id: resp[0].id
                });
            }.bind(this)).catch (function(e) {
                console.log(e);
            }.bind(this));
        }else{

            Promise.resolve(this.workflow.load(this.options.params.id)).then(function() {
                //if there is no id, then reload the page with action/select-technician 
                if (!this.params.id || this.params.action == 'select-technicians') {
                    return this.renderSelectTechnicianView();
                }
    
                if (this.params.action == 'select-services') {
                    return this.renderSelectServicesView();
                }
    
                return this.renderEditView();
            }.bind(this)).then(this.ready.bind(this));
            var events = {};
            events['click #' + this.getId('back')] = 'backButtonClickHandler';
            this.delegateEvents(events);
        }
    };

    Page.prototype.renderSelectTechnicianView = function() {
        this.$el.html(Template({
            id: this.getId(),
            selectTechnician: true
        }));

        this.mapControls();


        this.controls.ui = new SelectTechnicianView(_.extend({}, this.options, {
            el: this.controls.selectTechnician,
            container: this
        }));

        this.controls.ui.on('created', function(results) {
            if (this.options.params.id) {
                this.reload({
                    action: 'edit'
                });
            }
            else {
                this.reload({
                    action: 'select-services',
                    id: results[0].id
                });
            }
        }, this);

        return this.controls.ui.render();
    };


    Page.prototype.renderSelectServicesView = function() {
        //make sure that the user can view the ticket first
        if (!this.workflow.rules.getByActionId(Action.VIEW)) {
            return Promise.reject('Permission denied!');
        };

        return Promise.resolve().then(function() {
            return this.workflow.process(Action.VIEW, this.options.params.id);
        }.bind(this)).then(function(resp) {
            var ticket = new Ticket(resp[0]);
            this.$el.html(Template({
                id: this.getId(),
                selectServices: true
            }));

            this.mapControls();


            this.controls.ui = new SelectServicesView(_.extend({}, this.options, {
                el: this.controls.selectServices,
                container: this,
                ticket: ticket
            }));

            this.controls.ui.on('selected', function(result) {
                this.reload({
                    id: this.options.params.id,
                    action: 'edit'
                });
            }, this);

            this.controls.ui.render();
        }.bind(this));
    };

    Page.prototype.renderEditView = function() {
        //make sure that the user can view the ticket first
        if (!this.workflow.rules.getByActionId(Action.VIEW)) {
            this.toast.error("Ticket does not exist or you don't have permission to view it!");
            return Promise.reject();
        };

        return Promise.resolve().then(function() {
            return this.workflow.process(Action.VIEW, this.options.params.id);
        }.bind(this)).then(function(resp) {
            var ticket = new Ticket(resp[0]);

            this.$el.html(Template({
                id: this.getId(),
                editView: true,
                ticket: ticket
            }));

            this.mapControls();


            this.controls.ui = new EditView(_.extend({}, this.options, {
                el: this.controls.editView,
                container: this,
                ticket: ticket
            }));

            // this.controls.ui.on('selected', function(result){
            //     this.reload({id: this.options.params.id, action: 'edit'});
            // }, this);

            return this.controls.ui.render();

        }.bind(this));
    };



    return Page;


});