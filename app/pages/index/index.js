define(function(require) {
    var Super = require('views/page'),
        Template = require('hbs!./index.tpl'),
        Sidebar = require('views/controls/sidebar'),
        Promise = require('bluebird');

    var Page = Super.extend({});
    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);

    };

    Page.prototype.render = function() {
        Promise.resolve().then(function() {
            this.$el.html(Template({
                id: this.id
            }));
            this.mapControls();
            
            this.sidebar = new Sidebar({
                el: this.controls.sidebar
            });
            this.sidebar.render();
            
            return this.ready();
        }.bind(this));
    };

    return Page;


});