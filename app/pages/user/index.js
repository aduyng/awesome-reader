define(function (require) {
    var Super = require('views/page'),
        UserCollection = require('../../collections/user'),
        Role = require('../../models/role'),
        Promise = require('bluebird'),
        Template = require('hbs!./index.tpl');

    var Page = Super.extend({
                            });

    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.collection = new UserCollection();
    };

    Page.prototype.render = function () {
        return Promise.resolve(this.collection.fetch({
            storeId: this.session.storeId
        }))
        .then(function(){
            this.$el.html(Template({
                                       id: this.id,
                                       users: this.collection.map(function (model) {
                                           return _.extend(model.toJSON(), {
                                               isOwner: model.get('roleId') == Role.OWNER
                                               });
                                       })
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