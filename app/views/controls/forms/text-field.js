define(function (require) {
    var Super = require('../../base'),
        Template = require('text!./text-field.html');

    var View = Super.extend({
    });

    View.prototype.initialize = function (options) {
        var defaults = {
            label: 'Label',
            type: 'text',
            value: '',
            hint: ''
//            ,validate: undefined
        };
        options = _.extend(defaults, options);
        Super.prototype.initialize.call(this, options);
    };

    View.prototype.render = function () {
        var opts = _.clone(this.options);
        opts.id = this.id;
        this.$el.html(Mustache.to_html(Template, opts));
        this.mapControls();
//        if (this.options.validate) {
//            var rules = {};
//            rules[this.controls.input.attr('id')] = this.options.validate;
//
//            this.initValidator({
//                rules: rules
//            });
//            this.validator.form();
//        }
    };

    View.prototype.focus = function () {
        this.controls.input.focus();
    };

    View.prototype.val = function (value) {
        if (value !== undefined) {
            return this.controls.input.val(value);
        }
        return this.controls.input.val();
    };
    return View;


});