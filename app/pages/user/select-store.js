define(function(require) {
    var Super = require('views/page'),
        Template = require('hbs!./select-store.tpl'),
        StoreCollection = require('collections/store'),
        User = require('models/user'),
        Promise = require('bluebird');

    var Page = Super.extend({});
    
    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        
        this.stores = new StoreCollection();
        this.stores.url = '/rest/user/' + this.session.userId + '/stores';
        
    };

    Page.prototype.render = function() {
        var user = new User({
            id: this.session.userId
        });
        Promise.resolve(this.stores.fetch()).then(function() {
            this.$el.html(Template({
                id: this.id,
                stores: this.stores.toJSON()
            }));

            this.ready();
        }.bind(this));

    };

    return Page;


});