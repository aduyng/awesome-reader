/*global _*/
define(function(require) {
    var Super = require('views/page'),
        ProductCollection = require('collections/product'),
        CategoryCollection = require('collections/category'),
        Product = require('models/product'),
        Promise = require('bluebird'),
        Template = require('hbs!./index.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.categories = new CategoryCollection();
    };

    Page.prototype.render = function() {
        return Promise.resolve(this.categories.fetch({
            data: {
                products: true
            }
        })).then(function() {
            this.$el.html(Template({
                id: this.id,
                categories: this.categories.toJSON()
            }));
            
            this.mapControls();

            var events = {};
            events['click .' + this.getId('category-heading')] = 'categoryHeadingClickHandler';
            events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';

            this.delegateEvents(events);

            this.ready();
        }.bind(this));
    };

    Page.prototype.categoryHeadingClickHandler = function(event) {
        var e = $(event.currentTarget);
        this.$el.find('#' + this.getId('category-body-' + e.data('id'))).toggleClass('hide');
    };

    return Page;


});