/*global Ladda, NProgress*/
define(function(require) {
    var Super = require('views/page'),
        Store = require('models/store'),
        Promise = require('bluebird'),
        Template = require('hbs!./edit.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.store = new Store({id: this.session.storeId});
    };

    Page.prototype.render = function() {
        Promise.resolve(this.store.fetch()).then(function() {


            this.$el.html(Template({
                id: this.id,
                settings: this.store.toJSON()
            }));
            this.mapControls();
            this.parseMessages();
            this.controls.defaultCommissionRatio.TouchSpin();
            this.controls.turnThresholdAmount.TouchSpin();
            this.controls.defaultTipDeductionRatio.TouchSpin();
            this.controls.defaultCashRatio.TouchSpin();
            this.controls.defaultSalaryWarrantedAmount.TouchSpin();


            var events = {};
            events['click #' + this.controls.save.attr('id')] = 'saveButtonClickHandler';
            events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';
            this.delegateEvents(events);
            this.ready();
        }.bind(this));
    };

    Page.prototype.saveButtonClickHandler = function(event) {
        event.preventDefault();
        var serializedData = this.serialize();
        this.store.set(serializedData);
        var l = Ladda.create(event.currentTarget);
        l.start();
        NProgress.start();
        Promise.resolve(this.store.save())
            .then(function(){
                this.toast.success(this.i18n.storeHasBeenSavedSuccessfully);
            
                this.back();
            }.bind(this))
            .finally(function(){
                NProgress.done();
                l.stop();
            })
    };

    return Page;


});