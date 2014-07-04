/*global _*/
define(function (require) {
    var Super = require('./base'),
        Toastr = require('toastr'),
        Promise = require('bluebird'),
        User = require('../models/user'),
        Page = Super.extend({
                            });


    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);

        this.app = options.app;
        this.layout = options.app.layout;
        this.router = options.app.router;
        this.session = options.app.session;
        this.socket = options.app.socket;
        this.toast = Toastr;
        this.config = window.app.config;
        this.ds = window.app.ds;
        this.params = options.params;
        this.user = new User(this.session.get('user'));

        this.toast.options = {
            "closeButton"    : false,
            "debug"          : false,
            "positionClass"  : "toast-bottom-right",
            "onclick"        : null,
            "showDuration"   : "300",
            "hideDuration"   : "1000",
            "timeOut"        : "5000",
            "extendedTimeOut": "1000",
            "showEasing"     : "swing",
            "hideEasing"     : "linear",
            "showMethod"     : "fadeIn",
            "hideMethod"     : "fadeOut"
        };

    };

    Page.prototype.start = function () {
        this.trigger('start');
        return Promise.resolve();
    };

    Page.prototype.render = function () {
        this.ready();
    };

    Page.prototype.ready = function () {
        this.trigger('ready');
    };

    Page.prototype.cleanUp = function () {

    };

    Page.prototype.close = function () {
        this.cleanUp();

        this.undelegateEvents();
        this.$el.empty();
    };

    Page.prototype.reload = function (options) {
        var params = _.extend(this.options.params, {rand: new Date().getTime()}, options);
        var url = this.generateHash(this.options.controller, this.options.action, params);
        this.router.navigate(url, {trigger: true, replace: true});
    };

    Page.prototype.generateHash = function (controller, action, params) {
        var parts = [controller, action];
        var keys = _.keys(params);
        
        _.forEach(keys, function (index) {
            var value = params[index];
            
            if( value !== undefined ){
                parts.push(index);
                parts.push(encodeURIComponent(value));
            }
        });
        // console.log(controller, action, params, parts);
        return parts.join('/');
    };

    Page.prototype.backButtonClickHandler = function (event) {
        event.preventDefault();
        this.back();


    };

    Page.prototype.back = function () {
//        var backUrl = this.session.get('backUrl');
//        if( !backUrl ){
        window.history.back();
//        }else{
//            this.router.navigate(backUrl, {trigger: true});
//            this.session.unset('backUrl');
//        }
    };

    Page.prototype.setBackLink = function () {
        this.session.set('backUrl', window.location.hash);
    };

    Page.prototype.goTo = function (hash, options) {
        var url = hash;
        
        if (_.isObject(hash)) {
            // console.log(hash, _.omit(hash, 'controller', 'action'));
            url = this.generateHash(hash.controller || this.options.controller, 
                hash.action || this.options.action, _.omit(hash, 'controller', 'action'));
        }
        this.router.navigate(url, options || {trigger: true});
    };


    return Page;


});