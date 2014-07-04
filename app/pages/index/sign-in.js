/*global _, Ladda*/
define(function(require) {
    var Super = require('views/page'),
        _s = require('underscore.string'),
        Template = require('hbs!./sign-in.tpl');


    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
    };

    Page.prototype.render = function() {
        //remove the previous session
        this.session.destroy();

        this.$el.html(Template({
            id: this.id
        }));
        
        this.mapControls();


        var events = {};
        this.delegateEvents(events);


        this.ready();
    };

    return Page;


});