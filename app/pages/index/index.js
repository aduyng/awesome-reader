define(function(require) {
    var Super = require('views/page'),
        Template = require('hbs!./index.tpl'),
        User = require('models/user'),
        StoreCollection = require('collections/store'),
        Promise = require('bluebird'),
        Role = require('models/role');

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
        Promise.all([user.fetch(), this.stores.fetch()]).then(function() {
            this.$el.html(Template({
                id: this.id,
                isOwner: this.session.isOwner,
                userName: user.name,
                stores: this.stores.toJSON()
            }));

            return this.ready();
        }.bind(this));

    };

    return Page;


});