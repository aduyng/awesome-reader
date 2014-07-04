/*global _*/
define(function(require) {
    var Super = require('views/page'),
        StoreCollection = require('collections/store'),
        Promise = require('bluebird'),
        Template = require('hbs!./my-stores.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.collection = new StoreCollection();
        this.collection.url = '/rest/user/' + this.session.userId + '/stores';
    };

    Page.prototype.render = function() {
        return Promise.resolve(this.collection.fetch()).then(function() {
            this.$el.html(Template({
                id: this.id,
                stores: this.collection.toJSON()
            }));
            
            this.mapControls();

            var events = {};
            events['click .' + this.getId('store')] = 'storeClickHandler';
            events['click #' + this.getId('new')] = 'newClickHandler';
            events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';

            this.delegateEvents(events);

            this.ready();
        }.bind(this));
    };

    Page.prototype.storeClickHandler = function(event) {
        var e = $(event.currentTarget);
        
    };

    Page.prototype.newClickHandler = function(event) {
        var e = $(event.currentTarget);
        
    };

    return Page;


});