/* global Backbone*/

define(function(require) {

    //require the layout
    var Super = Backbone.Model,
        Layout = require('views/layout'),
        Router = require('./router'),
        Session = require('models/session'),
        Config = require('models/config'),
        Toastr = require('toastr'),
        Handlebars = require('hbs/handlebars');

    var App = Super.extend({});

    App.prototype.initialize = function(options) {
        Super.prototype.initialize.call(this, options);

        this.initConfig();
        this.initSession();
        this.initLayout();
        this.initRouter();

    };


    App.prototype.initConfig = function() {
        this.config = new Config(window.config);
    };


    App.prototype.initRouter = function() {
        this.router = new Router({
            app: this
        });
    };

    App.prototype.initLayout = function() {
        this.layout = new Layout({
            app: this
        });
    };
    App.prototype.initSession = function() {
        this.session = new Session(window.session);
    };

    App.prototype.run = function() {
        //load all static list first
        this.layout.render();

        //create router
        this.router.start();

    };


    Object.defineProperty(App.prototype, 'router', {
        get: function() {
            return this.get('router');
        },
        set: function(val) {
            this.set('router', val);
        }
    });

    Object.defineProperty(App.prototype, 'layout', {
        get: function() {
            return this.get('layout');
        },
        set: function(val) {
            this.set('layout', val);
        }
    });

    Object.defineProperty(App.prototype, 'session', {
        get: function() {
            return this.get('session');
        },
        set: function(val) {
            this.set('session', val);
        }
    });
    Object.defineProperty(App.prototype, 'ds', {
        get: function() {
            return this.get('ds');
        },
        set: function(val) {
            this.set('ds', val);
        }
    });

    Object.defineProperty(App.prototype, 'config', {
        get: function() {
            return this.get('config');
        },
        set: function(val) {
            this.set('config', val);
        }
    });



    window.app = new App({});
    window.app.run();


    return App;
});