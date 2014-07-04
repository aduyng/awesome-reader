define(function (require) {
    var Super = require('views/base'),
        Nav = require('views/nav'),
        Template = require("hbs!views/layout.tpl");

    var Layout = Super.extend({
                                  el: 'body'
                              });

    Layout.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);

        if (!options.app) {
            throw new Error("app must be passed!");
        }

        this.app = options.app;
    };

    Layout.prototype.render = function () {
        
        this.$el.html(Template({
                                   id  : this.id,
                                   name: window.config.name,
                                   version: window.config.version
                               }));
        this.mapControls();

        this.nav = new Nav({
                               el: this.controls.nav
                           });
        this.nav.render();

        this.trigger('drew', this);

    };


    return Layout;
});