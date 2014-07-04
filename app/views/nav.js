/*global */
define(function (require) {

    var Super = require('views/base'),
        Promise = require('bluebird'),
        accounting = require('accounting'),
        Template = require('hbs!./nav.tpl');

    var View = Super.extend({

                            });

    View.prototype.render = function () {
        var storeName = window.config.name;

        if( window.app && window.app.ds && window.app.ds.store && window.app.ds.store.name){
            storeName =  window.app.ds.store.name;
        }
        

        this.$el.html(Template({
                                   id       : this.id,
                                   storeName: storeName
                               }));
        this.mapControls();
        

        if (window.app.session.userId) {
            // this.controls.todos.removeClass('hide');
            // this.controls.feeds.removeClass('hide');
            // this.refreshFeedCount();
            // window.setInterval(this.refreshFeedCount.bind(this), app.config.get('app').refreshFeedInterval * 1000);
            // this.refreshTodoCount();
            // window.setInterval(this.refreshTodoCount.bind(this), app.config.get('app').refreshTodoInterval * 1000);

        }
        var events = {};
        events['click ' + this.toId('refresh-icon')] = 'refreshButtonClickHandler';
        this.delegateEvents(events);
        
    };
    
    View.prototype.refreshButtonClickHandler = function(event){
        window.location.reload();  
    };
    
    
    View.prototype.requestFeedCount = function () {
        if (this.feedXHR) {
            this.feedXHR.abort();
        }

        this.feedXHR = app.socket.request({
                                              url: '/rest/feeds/count'
                                          });
        return this.feedXHR;
    };

    View.prototype.refreshFeedCount = function () {
        this.controls.feedIcon.addClass('fa-spin');
        Promise.resolve(this.requestFeedCount())
            .then(function (resp) {
                      if (!resp || resp.count == 0) {
                          this.controls.feedCount.addClass('hide');
                      } else {
                          this.controls.feedCount.removeClass('hide');
                          this.controls.feedCount.text(accounting.formatNumber(resp.count));
                      }
                  }.bind(this))
            .finally(function () {
                         this.controls.feedIcon.removeClass('fa-spin');
                     }.bind(this))
    };


    View.prototype.requestTodoCount = function () {
        if (this.todoXHR) {
            this.todoXHR.abort();
        }

        this.todoXHR = app.socket.request({
                                              url: '/rest/todos/count'
                                          });
        return this.todoXHR;
    };

    View.prototype.refreshTodoCount = function () {
        this.controls.todoIcon.addClass('fa-spin');
        Promise.resolve(this.requestTodoCount())
            .then(function (resp) {
                      if (!resp || resp.count == 0) {
                          this.controls.todoCount.addClass('hide');
                      } else {
                          this.controls.todoCount.removeClass('hide');
                          this.controls.todoCount.text(accounting.formatNumber(resp.count));
                      }
                  }.bind(this))
            .finally(function () {
                         this.controls.todoIcon.removeClass('fa-spin');
                     }.bind(this))
    };


    return View;
});