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
        };
        options = _.extend(defaults, options);
        Super.prototype.initialize.call(this, options);
    };

    View.prototype.render = function () {
        var opts = _.clone(this.options);
        opts.id = this.id;
        this.$el.html(Mustache.to_html(Template, opts));
        this.mapControls();

//        this.controls.input.on('focus', function(){
//            this.controls.input.select();
//        }, this);
        this.controls.input.focus();
    };

    View.prototype.focus = function(){
        this.controls.input.focus();
    };


    return View;


});