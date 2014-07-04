define(function (require) {
    var Super = require('../base'),
        Template = require('hbs!./pin-entry.tpl');

    var View = Super.extend({
    });

    View.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);
        this.pin = '';
    };

    View.prototype.render = function () {
        this.$el.html(Template({
            id: this.id,
            digits: _.range(0,10)
        }));
        this.mapControls();

        var events = {};
        events['click .digit'] = 'onDigitClickHandler';
        events['click #' + this.controls.reset.attr('id')] = 'onResetClickHandler';
        this.delegateEvents(events);

        this.updatePIN('');
    };
    View.prototype.updatePIN = function (pin) {
        this.pin = pin;
        var genHiddenPIN = function (pin) {
            var i;
            var pieces = [];
            for (i = 0; i < pin.length; i++) {
                pieces.push('*');
            }
            return pieces.join('');
        };
        this.controls.pinLabel.val(genHiddenPIN(pin));

        if (this.pin.length >= 4) {
            this.$el.find('.digit').attr('disabled', true).addClass('disabled');
        } else {
            this.$el.find('.digit').removeAttr('disabled').removeClass('disabled');
        }
        if (this.pin.length > 0) {
            this.controls.reset.removeAttr('disabled').removeClass('disabled');
        } else {
            this.controls.reset.attr('disabled', true).addClass('disabled');
        }
    };
    View.prototype.onDigitClickHandler = function (event) {
        event.preventDefault();
        this.updatePIN(this.pin + $(event.currentTarget).text());
    };

    View.prototype.onResetClickHandler = function (event) {
        this.updatePIN('');
    };

    View.prototype.onDoneClickHandler = function (event) {
        this.trigger('done', this.pin);
    };

    View.prototype.val = function (v) {
        if (v) {
            this.updatePIN(v);
            return this;
        }
        return this.pin;
    };

    return View;


});