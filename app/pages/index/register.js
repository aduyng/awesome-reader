/*global _, Ladda, NProgress, Backbone*/
define(function(require) {
    var Super = require('views/page'),
        _s = require('underscore.string'),
        Promise = require('bluebird'),
        Role = require('models/role'),
        Template = require('hbs!./register.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.model = new Backbone.Model();
        this.model.url = '/user/register';
    };
    

    Page.prototype.render = function() {
        return Promise.resolve().then(function() {
            this.$el.html(Template({
                id: this.id
            }));
            this.mapControls();
            this.parseMessages();

            this.initValidators({
                fields: {
                    name: {
                        validators: {
                            notEmpty: {
                                message: this.i18n.nameCantBeEmpty
                            }
                        }
                    },
                    phone: {
                        validators: {
                            notEmpty: {
                                message: this.i18n.phoneNumberCantBeEmpty
                            },
                            phone: {
                                message: this.i18n.phoneNumberIsInvalid
                            },
                            remote: {
                                message: this.i18n.phoneNumberExists,
                                url: '/user/availability'
                            }
                        }
                    },
                    
                    pin: {
                        validators: {
                            notEmpty: {
                                message: this.i18n.pinCantBeEmpty
                            },
                            between: {
                                message: this.i18n.pinMustBe4Digits,
                                min: 1000,
                                max: 9999,
                                inclusive: true
                            }
                        }
                    },
                    pin2: {
                        validators: {
                            notEmpty: {
                                message: this.i18n.pinCantBeEmpty
                            },
                            between: {
                                message: this.i18n.pinMustBe4Digits,
                                min: 1000,
                                max: 9999,
                                inclusive: true
                            },
                            identical: {
                                field: 'pin',
                                message: this.i18n.pinMustBeTheSame
                            }
                        }
                    }
                }
            });


            var events = {};
            events['click #' + this.controls.save.attr('id')] = 'saveButtonClickHandler';
            events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';
            events['input ' + this.toClass('pin')] = 'pinInputHandler';
            this.delegateEvents(events);
            this.ready();
        }.bind(this));
    };

    Page.prototype.pinInputHandler = function(event) {
        var e = $(event.currentTarget);
        var mask = e.closest('.form-group').find('.pin-mask');
        mask.html(_s.repeat('&#8226;', e.val().length));
    };

    Page.prototype.saveButtonClickHandler = function(event) {
        event.preventDefault();
        if (this.isValid()) {
            var serializedData = this.serialize();
            serializedData.pin = this.controls.pin.val();
            
            this.model.set(serializedData);
            var l = Ladda.create(event.currentTarget);
            l.start();
            NProgress.start();
            Promise.resolve(this.model.save()).then(function() {
                this.toast.success(this.i18n.registrationCompletedSuccessfully);
                this.back();
            }.bind(this))
            .finally(function() {
                NProgress.done();
                l.stop();
            });
        }
    };

    return Page;


});