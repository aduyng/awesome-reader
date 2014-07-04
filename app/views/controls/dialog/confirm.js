define(function (require) {
    var Super = require('../../base'),
        Template = require('text!./confirm.html');

    var View = Super.extend({
        className: 'modal fade'
    });
    View.prototype.initialize = function (options) {
        options = options || {};
        options.yes = options.yes || 'Yes';
        options.yesClass = options.yesClass || 'btn-danger';
        options.no = options.no || 'No';
        options.message = options.message || 'Are you sure?';
        options.messageClass = options.messageClass || 'text-danger';

        //super(options)
        Super.prototype.initialize.call(this, options);

        this.__initEventHandlers();
    };

    View.prototype.open = function () {
        this.$el.html(Mustache.to_html(Template, {
            id: this.getId(),
            yes: this.options.yes,
            no: this.options.no,
            yesClass: this.options.yesClass,
            message: this.options.message,
            messageClass: this.options.messageClass
        }));

        this.$el.appendTo($('body'));
        this.$el.modal({
            keyboard: false,
            show: true,
            backdrop: 'static'
        });

        this.$el.on('hidden.bs.modal', function () {
            this.remove();
        }, this)
    };


    View.prototype.__initEventHandlers = function () {
        var events = {};
        events['click #' + this.getId('yes')] = '__yesClickHandler';
        this.delegateEvents(events);
    };

    View.prototype.__yesClickHandler = function (event) {
        event.preventDefault();
        this.trigger('yes');
        this.$el.modal('hide');
    };

    return View;
});