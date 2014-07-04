/*global NProgress, Ladda*/
define(function(require) {
    var Super = require('views/page'),
        Promise = require('bluebird'),
        Model = require('models/product'),
        Category = require('models/category'),
        Template = require('hbs!./edit.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.model = new Model({
            id: this.options.params.id,
            categoryId: this.options.params.category
        });
        this.category = new Category({id: this.options.params.category});

    };

    Page.prototype.render = function() {

        return Promise.resolve(this.category.fetch()).then(function() {
            if (this.options.params.id) {
                return this.model.fetch();
            }
        }.bind(this)).then(function() {
            this.$el.html(Template({
                id: this.id,
                product: this.model.toJSON(),
                category: this.category.toJSON()
            }));
            this.mapControls();
            this.parseMessages();

            if (this.options.params.id) {
                this.controls.delete.bootstrapConfirmButton({
                    sure: this.deleteButtonClickHandler.bind(this)
                });
            }

            this.controls.price.TouchSpin();


            var events = {};
            events['click #' + this.controls.save.attr('id')] = 'saveButtonClickHandler';
            events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';
            this.delegateEvents(events);


            this.ready();
        }.bind(this));
    };

    Page.prototype.saveButtonClickHandler = function(event) {
        event.preventDefault();
        this.save(event);
    };


    Page.prototype.save = function(event) {
        event.preventDefault();

        this.model.set(this.serialize());

        var l = Ladda.create(event.currentTarget);
        l.start();
        NProgress.start();
        Promise.resolve(this.model.save()).then(function() {
            this.toast.success(this.i18n.serviceCategoryHasBeenSavedSuccessfully);
            this.goTo('product/index');
        }.bind(this)).
        finally(function() {
            NProgress.done();
            l.stop();
        });
    };

    Page.prototype.deleteButtonClickHandler = function(event) {
        var l = Ladda.create(event.currentTarget);
        l.start();

        NProgress.start();
        Promise.resolve(this.model.destroy()).then(function() {
            this.toast.success(this.i18n.serviceCategoryHasBeenDeletedSuccessfully);
            this.goTo('product/index');
        }.bind(this)).
        finally(function() {
            NProgress.done();
            l.stop();
        });
    };


    return Page;


});