define(function (require) {
    var Super = require('../base');

    var View = Super.extend({
        className: 'list-group'
    });

    View.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);
        if (!this.collection) {
            throw new Error("options.collection must be passed!");
        }

    };

    View.prototype.render = function () {
        this.mapControls();
        this.collection.on('reset add remove', function () {
            this.draw();
        }, this);

        var events = {};
        events['click .list-group-item'] = 'onItemClickHandler';

        this.delegateEvents(events);
    };

    View.prototype.draw = function () {

        var transformer = this.options.transformer || function (model, index) {
            return {
                id: model.id,
                name: model.name
            };
        };


        this.$el.html(
            Mustache.to_html('<div class="list-group">{{{items}}}</div>', {
                    items: this.collection.reduce(function (memo, model, index) {
                        var data = _.extend({
                            index: index
                        }, transformer.call(this, model, index));
                        return memo + Mustache.to_html('<a href="#" data-index="{{index}}" data-id="{{id}}" class="list-group-item {{itemClass}}">{{{name}}}</a>', data);
                    }, '', this)
                }
            )
        );
    };

    View.prototype.onItemClickHandler = function (event) {
        event.preventDefault();
        var e = $(event.currentTarget);

        this.trigger('item-click', this.collection.get(e.data('id')), e, parseInt(e.data('index'), 10));
    };

    return View;


});