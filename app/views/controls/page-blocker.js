define(function (require) {
    var Super = require('../base'),
        Template = require('hbs!./page-blocker.tpl');

    var View = Super.extend({
    });

    View.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);
    };

    View.prototype.render = function () {
        this.$el.html(Template({
            id: this.id
        }));
        this.mapControls();
        this.$el.appendTo('body');
    };

    View.prototype.show = function () {
        this.controls.container.removeClass('hide');
    };

    View.prototype.hide = function () {
        this.controls.container.addClass('hide');
    };

    return View;


});