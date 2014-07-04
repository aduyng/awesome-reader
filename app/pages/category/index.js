/*global Backbone, _*/
define(function(require) {
    var Super = require('views/page'),
        Promise = require('bluebird'),
        CategoryCollection = require('collections/category'),
        Template = require('hbs!./index.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.categories = new CategoryCollection();
    };

    Page.prototype.render = function() {
        return Promise.resolve(this.categories.fetch()).then(function() {

            this.$el.html(Template({
                id: this.id,
                categories: this.categories.toJSON()
            }));
            this.mapControls();

            var events = {};
            events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';

            this.delegateEvents(events);

            this.ready();
        }.bind(this));


};

return Page;


});