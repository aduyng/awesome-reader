
define(function(require) {
    var Backbone = require('backbone'),
        progress = require('views/controls/progress'),
        moment = require('moment'),
        Toastr = require('toastr'),
        Promise = require('bluebird'),
        Router = Backbone.Router.extend({
            routes: {
                "*action": 'defaultAction'
            }
        });
    Router.prototype.initialize = function(options) {
        Backbone.Router.prototype.initialize.call(this, options);
        this.app = options.app || console.error("app must be passed!");
    };

    Router.prototype.defaultAction = function(url) {

        if (!url) {
            url = 'index/index';
        }
        if (this.app.page) {
            //clean up
            this.app.page.close();
            //trigger an event
            this.app.trigger('closed');
        }

        //split the url to controller/action
        var parts = url.split('/');
        var controller = parts[0] || 'index';
        var action = parts[1] || 'index';
        var params = {
            now: moment().unix()
        };
        if (parts.length > 2) {
            var i;
            for (i = 2; i < parts.length; i += 2) {
                params[_s.camelize(parts[i])] = parts[i + 1];
            }
        }
        var session = this.app.session;
        var userId = session.get('userId');

        if (!userId && !(controller === 'index' && action === 'sign-in') && !(controller === 'index' && action === 'register')) {
            session.set('redirectUrl', window.location.hash);
            console.log("Will navigate to " + 'index/sign-in');
            this.navigate('index/sign-in', {
                replace: true,
                trigger: true
            });
            return;
        }

        // if(!session.get('storeId') && !(controller === 'user' && action === 'select-store') ){
        //     //navigate to select store
        //     this.navigate('user/select-store', {replace: true, trigger: true});
        //     return;
        // }

        progress.start();

        var pagePath = 'pages/' + controller + '/' + action;

        require([pagePath], function(Page) {
            progress.inc();
            this.app.page = new Page({
                el: this.app.layout.controls.mainPanel,
                controller: controller,
                action: action,
                app: this.app,
                params: params
            });
            var actionContainer = this.app.layout.controls.mainPanel.parent();
            actionContainer.attr('id', 'action-' + action);
            var controllerContainer = actionContainer.parent();
            controllerContainer.attr('id', 'controller-' + controller);


            this.listenToOnce(this.app.page, 'ready', function() {
                progress.done();
            });

            this.app.page.start();
            progress.inc();
            Promise.resolve(this.app.page.render())
            .then(function(){
                progress.done();
                this.app.trigger('page-rendered', this.app.page);
            }.bind(this));
            

        }.bind(this));

    };
    
    Router.prototype.parseUrlParams = function(url) {
        if (!url) {
            url = window.location.hash;
        }
        var parts = url.split('/');
        var params = {};

        if (parts.length > 2) {
            var i;
            for (i = 2; i < parts.length; i += 2) {
                params[parts[i]] = decodeURIComponent(parts[i + 1]);
            }
        }
        return params;
    };

    Router.prototype.start = function() {
        Backbone.history.start();
    };


    return Router;
});