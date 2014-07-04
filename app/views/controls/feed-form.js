define(function(require) {
    var Super = require('views/base'),
        Feed = require('models/feed'),
        Template = require("hbs!./feed-form.tpl");

    var View = Super.extend({});

    View.prototype.initialize = function(options) {
        Super.prototype.initialize.call(this, options);

        if (!this.model) {
            this.model = new Feed();
        }


    };

    View.prototype.render = function() {

        this.$el.html(Template({
            id: this.id,
            data: _.extend(this.model.toJSON(), {
                imageIconUrl: this.model.get('iconUrl') || 'http://placehold.it/16&text=...'
            })
        }));
        this.mapControls();

        var events = {};
        events['click ' + this.toId('auto-fill')] = 'autoFillClickHandler';

        this.delegateEvents(events);
    };


    View.prototype.autoFillClickHandler = function(event) {
        var url = this.controls.url.val();

        if (url.length > 0) {
            var m = new Backbone.Model();
            m.url = '/feed/parse-info';
            Promise.resolve(m.fetch({
                data: {
                    url: url
                }
            })).then(function() {
                this.controls.name.val(m.get('name'));
                this.controls.iconUrl.val(m.get('iconUrl'));
                this.controls.icon.attr('src', m.get('iconUrl'));
            }.bind(this));
        }
    };

    return View;
});