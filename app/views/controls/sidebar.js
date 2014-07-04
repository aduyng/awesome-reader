define(function (require) {
    var Super = require('views/base'),
        Switch = require('./switch'),
        Dialog = require('./dialog'),
        FeedForm = require('./feed-form'),
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
    
    View.prototype.newClickHandler = function(event){
        var form = new FeedForm({
            
        });
        var dialog = new Dialog({
            title: 'Add a new Feed',
            body: form,
            autoOpen: true 
        });
        
    };
    
    
    View.prototype.draw = function(){
        var editable = this.controls.lockSwitch.bootstrapSwitch('state');
        
        this.controls.list.html(FeedsTemplate({
            feeds: this.feeds.toJSON()
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