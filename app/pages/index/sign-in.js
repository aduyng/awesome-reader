/*global _, Ladda*/
define(function(require) {
    var Super = require('views/page'),
        _s = require('underscore.string'),
        Users = require('../../collections/user'),
        Template = require('hbs!./sign-in.tpl');


    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.collection = new Users();


    };

    Page.prototype.navigateToIndex = function() {
        var redirectUrl = this.session.get('redirectUrl');
        if (!redirectUrl || redirectUrl.match(/^#?index\/sign-in/)) {
            redirectUrl = 'index/index';
        }

        this.session.unset('redirectUrl');
        this.router.navigate(redirectUrl, {
            replace: true,
            trigger: true
        });
    };

    Page.prototype.render = function() {
        //remove the previous session
        this.session.destroy();

        this.$el.html(Template({
            id: this.id
        }));
        this.mapControls();


        var events = {};
        events['click #' + this.controls.submit.attr('id')] = 'submitClickHandler';
        events['input ' + this.toId('pin')] = 'pinKeypressHandler';
        this.delegateEvents(events);


        this.ready();
    };

    Page.prototype.pinKeypressHandler = function(event) {

        this.controls.pinMask.html(_s.repeat('&#8226;', this.controls.pin.val().length));
    };

    Page.prototype.submitClickHandler = function(event) {
        event.preventDefault();
        this.submit(event);
    };


    Page.prototype.submit = function(event) {
        var l;

        var phone = this.controls.phone.val().trim();
        var pin = this.controls.pin.val().trim();

        //making ajax call to server to set store
        this.socket.request({
            controller: 'user',
            action: 'sign-in',
            data: {
                phone: phone,
                pin: pin
            },
            type: 'POST',
            beforeSend: function() {
                l = Ladda.create(event.currentTarget);
                l.start();
            },
            error: function() {
                this.controls.pin.val('');
                this.controls.pinMask.html('');
                l.stop();
            }.bind(this),
            success: function(resp) {
                var redirectUrl = this.session.get('redirectUrl');
                if (!redirectUrl) {
                    redirectUrl = '#index/index';
                }
                this.session.unset('redirectUrl');
                this.toast.success("You have successfully signed in.", null, {
                    timeOut: 2000,
                    onHidden: function() {
                        l.stop();
                        this.router.navigate(redirectUrl, {
                            replace: true
                        });
                        window.location.reload();
                    }.bind(this)
                });

            }.bind(this)
        });
    };

    return Page;


});