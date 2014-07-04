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
                            index: index
                        }, transformer.call(this, model, index));
                        data.parentId = this.id;

                        return memo + Mustache.to_html(
                            '<div class="radio">' +
                                '<label>' +
                                '<input class="cb" name="{{parentId}}" type="radio" data-id="{{id}}" data-index="{{index}}" value="{{id}}"/> {{{name}}}' +
                                '</label>' +
                                '</div>', data);
                    }, '', this)
                }
            )
        );

        if (this.val() === undefined) {
            this.val(this.collection.at(0).id);
        }
    };

    View.prototype.val = function (v) {
        if (v) {

            this.$el.find(_.sprintf('[value=%s]', v)).attr('checked', 'checked');
            return this;
        }
        return this.$el.find('.cb:checked').val();
    };

    View.prototype.onItemClickHandler = function (event) {
        var e = $(event.currentTarget);

        this.trigger('item-click', this.collection.get(e.data('id')), e.is(':checked'), e, parseInt(e.data('index'), 10));
    };

    return View;


});