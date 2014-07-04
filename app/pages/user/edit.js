/*global _, NProgress, Ladda*/
define(function (require) {
    var Super = require('views/page'),
        User = require('models/user'),
        Role = require('models/role'),
        Store = require('models/store'),
        Promise = require('bluebird'),
        RoleCollection = require('collections/role'),
        Template = require('hbs!./edit.tpl');

    var Page = Super.extend({
                            });

    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);

        if (options.params.id) {
            this.model = new User({
                id: options.params.id
            });
        } else {
            this.model = new User({
                                      name: 'New User',
                                      isActive: true,
                                      ownerId: this.session.userId
                                  });
        }
        
        this.roleCollection = this.ds.roles;
        this.store = this.ds.store;
    };

    Page.prototype.render = function () {
        return Promise.resolve()
        .then(function(){
            if( !this.model.isNew() ){
                return this.model.fetch();
            }
            return Promise.resolve();
        }.bind(this))
        .then(function(){
            var data = this.model.toJSON();
            data.isEditable = this.session.isOwner;
            data.commissionRatio = data.commissionRatio || this.store.get('defaultCommissionRatio');
            data.cashRatio = data.cashRatio || this.store.get('defaultCashRatio');
            if( !this.options.params.id){
                data.salaryWarrantedAmount = this.store.get('defaultSalaryWarrantedAmount');
            }
            data.isOwner = data.roleId == Role.OWNER;

            this.$el.html(Template({
                                       id: this.id,
                                       user: data,
                                       ownerRoleId: Role.OWNER,
                                       technicianRoleId: Role.TECHNICIAN,
                                       roles: this.roleCollection.map(function (role) {
                                           return _.extend(role.toJSON(), {selected: this.model.id ? role.id == this.model.roleId : role.id == Role.TECHNICIAN});
                                       }, this)
                                   }));
            this.mapControls();
            this.parseMessages();
            if (!this.model.isNew()) {
                this.controls.delete.bootstrapConfirmButton({
                                                                sure: this.deleteButtonClickHandler.bind(this)
                                                            });
            }
    
            this.controls.commissionRatio.TouchSpin();
            this.controls.cashRatio.TouchSpin();
            this.controls.salaryWarrantedAmount.TouchSpin();
    
    
            var events = {};
            events['click #' + this.controls.save.attr('id')] = 'saveButtonClickHandler';
            events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';
            this.delegateEvents(events);
    
    
            this.ready();
        }.bind(this));
    };

    Page.prototype.saveButtonClickHandler = function (event) {
        event.preventDefault();
        this.save();
    };


    Page.prototype.save = function () {
        event.preventDefault();
        var serializedData = this.serialize();
        this.model.set(serializedData);
        var l = Ladda.create(event.currentTarget);
        l.start();
        NProgress.start();
        Promise.resolve(this.model.save())
            .then(function(){
                this.toast.success(this.i18n.userHasBeenSavedSuccessfully);
                this.back();
            }.bind(this))
            .finally(function(){
                NProgress.done();
                l.stop();
            });
    };

    Page.prototype.deleteButtonClickHandler = function (event) {
        event.preventDefault();
        var l = Ladda.create(event.currentTarget);
        l.start();
        NProgress.start();
        Promise.resolve(this.model.destroy())
            .then(function(){
                this.toast.success(this.i18n.userHasBeenDeletedSuccessfully);
                this.back();
            }.bind(this))
            .finally(function(){
                NProgress.done();
                l.stop();
            });
    };


    return Page;


});