define(function (require) {
    var Super = require('../base'),
        Template = require('text!./dialog.html');

    var View = Super.extend({
        className: 'modal fade'

    });
    View.prototype.initialize = function (options) {
        var yes = {
            label: 'OK',
            iconClass: 'icon-check',
            buttonClass: 'btn-primary'
        };
        if (options && options.yes) {
            _.extend(yes, options.yes);
        }
        var no = {
            label: 'Cancel',
            iconClass: 'icon-remove',
            buttonClass: 'btn-default'
        };

        if (options && options.no) {
            _.extend(no, options.no);
        }
        options = options || {};
        options.yes = yes;
        options.no = no;

        //super(options)
        Super.prototype.initialize.call(this, options);
        if (this.options.autoOpen !== false) {
            this.open();
        }
    };

    View.prototype.open = function () {
        this.$el.html(Mustache.to_html(Template, {
            id: this.getId(),
            title: this.options.title,
            headerClass: this.options.title ? '' : 'hide',
            yes: this.options.yes,
            no: this.options.no
        }));
        this.mapControls();

        //render body
        if (this.options.body) {
            if (this.options.body instanceof Super) {
                this.options.body.render();
                this.options.body.$el.appendTo(this.controls.body);
            } else {
                this.controls.body.html(this.options.body);
            }
        }

        this.$el.appendTo($('body'));

        this.$el.modal({
            keyboard: false,
            show: true,
            backdrop: 'static'
        });

        this.$el.on('shown.bs.modal', function () {
            if (this.options.body && this.options.body instanceof Super && this.options.body.focus) {
                this.options.body.focus();
            }
        }.bind(this));
        this.$el.on('hidden.bs.modal', function () {
            this.remove();
        }.bind(this));

        var events = {};
        events['click #' + this.controls.yes.attr('id')] = 'onYesClickHandler';
        events['click #' + this.controls.no.attr('id')] = 'onNoClickHandler';
        this.delegateEvents(events);
    };


    View.prototype.onYesClickHandler = function (event) {
        event.preventDefault();
        this.trigger('yes', this);
    };

    View.prototype.onNoClickHandler = function (event) {
        event.preventDefault();
        this.trigger('no', this);
        this.close();
    };

    View.prototype.close = function () {
        this.$el.modal('hide');
    };

    Object.defineProperty(View.prototype, 'body', {
        get: function () {
            if (this.options.body instanceof Super) {
                return this.options.body;
            }
            return this.controls.body;
        }
    });

    return View;
});