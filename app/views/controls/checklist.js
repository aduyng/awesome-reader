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
        this.collection.on('reset add remove', function () {
            this.draw();
        }, this);

        var events = {};
        events['click input.cb'] = 'onItemClickHandler';

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
            Mustache.to_html('<div class="checklist">{{{items}}}</div>', {
                    items: this.collection.reduce(function (memo, model, index) {
                        var data = _.extend({
                            index: index,
                            checked: model.get('checked')
                        }, transformer.call(this, model, index));
                        data.checked = data.checked ? 'checked="checked"': '';

                        return memo + Mustache.to_html(
                            '<div class="checkbox">' +
                                '<label>' +
                                '<input class="cb" type="checkbox" data-id="{{id}}" data-index="{{index}}" value="{{id}}" {{{checked}}}/>{{{name}}}' +
                                '</label>' +
                                '</div>', data);
                    }, '', this)
                }
            )
        );
    };

    View.prototype.onItemClickHandler = function (event) {
        var e = $(event.currentTarget);

        this.trigger('item-click', this.collection.get(e.data('id')), e.is(':checked'), e, parseInt(e.data('index'), 10));
    };

    return View;


});