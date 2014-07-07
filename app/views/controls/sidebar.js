define(function (require) {
    var _ = require('underscore'),
        Super = require('views/base'),
        Switch = require('./switch'),
        Dialog = require('./dialog'),
        FeedForm = require('./feed-form'),
        Feed = require('models/feed'),
        FeedsTemplate = require('hbs!./sidebar-feeds.tpl'),
        FormTemplate = require('hbs!./feed-form.tpl'),
        FeedCollection = require('collections/feed'),
        Template = require("hbs!./sidebar.tpl");

    var View = Super.extend({
                              });

    View.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);
        
        this.feeds = new FeedCollection();
    };

    View.prototype.render = function () {
        
        this.$el.html(Template({
                                   id  : this.id
                               }));
        this.mapControls();
        
        this.controls.lockSwitch.bootstrapSwitch({
            onSwitchChange: this.lockSwitchChangeHandler.bind(this)
        });
                
        var events = {};
        events['click ' + this.toId('new')] = 'newClickHandler';
        events['click ' + this.toClass('edit')] = 'editClickHandler';
        events['click ' + this.toClass('delete')] = 'deleteClickHandler';
        this.delegateEvents(events);
        
        this.feeds.on('sync', this.draw.bind(this));
        this.fetch();
    };
    
    View.prototype.fetch = function(){
        return this.feeds.fetch({
            data: {
                userId: window.app.session.userId
            }
        });
    };

    View.prototype.editClickHandler = function(event){
        
        event.preventDefault();
        event.stopPropagation();
        var e = $(event.currentTarget);
        
        var model = this.feeds.get(e.data('id'));
        var form = new FeedForm({
            model: model
        });
        this.listenToOnce(model, 'sync', this.fetch.bind(this));
        
        var dialog = new Dialog({
            title: 'Edit a feed',
            body: form,
            autoOpen: true
        });
        
        dialog.on('yes', function(event){
            return Promise.resolve(model.save(_.extend(form.serialize(), {userId: window.app.session.userId})))
                .then(function(){
                    dialog.close();
                });
        });
    };
    
    View.prototype.deleteClickHandler = function(event){
        
        event.preventDefault();
        event.stopPropagation();
        var e = $(event.currentTarget);
        
        var model = this.feeds.get(e.data('id'));
        
        this.listenToOnce(model, 'sync', this.fetch.bind(this));

        return model.destroy();
                
    };
    
    View.prototype.newClickHandler = function(event){
        var model = new Feed();
        var form = new FeedForm({
            model: model
        });
        this.listenToOnce(model, 'sync', this.fetch.bind(this));
        
        var dialog = new Dialog({
            title: 'Add a new Feed',
            body: form,
            autoOpen: true
        });
        
        dialog.on('yes', function(event){
            return Promise.resolve(model.save(_.extend(form.serialize(), {userId: window.app.session.userId})))
                .then(function(){
                    dialog.close();
                });
        });
    };
    
    
    View.prototype.draw = function(){
        var editable = this.controls.lockSwitch.bootstrapSwitch('state');
        
        this.controls.list.html(FeedsTemplate({
            feeds: this.feeds.toJSON(),
            editable: editable,
            id: this.getId()
        }));
        
        if( editable ){
            this.controls.footer.removeClass('hidden');
        }else{
            this.controls.footer.addClass('hidden');
        }
    };
    
    View.prototype.lockSwitchChangeHandler = function(event, state){
        this.draw();
    };


    return View;
});