/*global */
define(function(require) {

    var Super = require('views/base'),
        Promise = require('bluebird'),
        accounting = require('accounting'),
        Template = require('hbs!./nav.tpl');

    var View = Super.extend({

    });

    View.prototype.render = function() {
        var name = window.config.name;

        this.$el.html(Template({
            id: this.id,
            name: name
        }));
        this.mapControls();


   
        var events = {};
        events['click ' + this.toId('refresh-icon')] = 'refreshButtonClickHandler';
        this.delegateEvents(events);

    };



    return View;
});