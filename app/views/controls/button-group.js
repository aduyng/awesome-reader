define(function (require) {
    var Super = require('../base');

    var View = Super.extend({
    });

    View.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);
        if (!this.collection) {
            throw new Error("options.collection must be passed!");
        }

    };

    View.prototype.render = function () {
        this.mapControls();
        this.collection.on(this.options.redrawEvents || 'reset add remove', function () {
            this.draw();
        }, this);

        var events = {};
        events['click button.btn'] = 'onItemClickHandler';

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
            Mustache.to_html('<div class="{{groupClass}}">{{{items}}}</div>', {
                    groupClass: this.options.groupClass || 'btn-group',
                    items: this.collection.reduce(function (memo, model, index) {
                        var data = _.extend({
                            index: index,
                            buttonClass: 'btn-default'
                        }, transformer.call(this, model, index));
                        return memo + Mustache.to_html('<button type="button" data-index="{{index}}" data-id="{{id}}" class="btn {{buttonClass}}">{{{name}}}</button>', data);
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