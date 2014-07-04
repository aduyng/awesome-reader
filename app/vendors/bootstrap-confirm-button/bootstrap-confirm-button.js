/**
 * Created by Duy A. Nguyen on 3/29/2014.
 */

(function ($) {

    $.fn.bootstrapConfirmButton = function (options) {
        var set = function (button) {
            var b = $(button);
            var settings = b.data('settings');

            b.addClass(settings.class);
            b.find('.bcb-label').text(settings.message);

            $('html').bind('click', monitor).data('bcb-button', b);
        };
        var revert = function (button) {
            var b = $(button);
            var settings = b.data('settings');
            if( settings ) {
                b.removeClass(settings.class);
                b.find('.bcb-label').text(settings.cachedMessage);
            }
            $('html').unbind('click', monitor);
        };

        var monitor = function (event) {
            revert($($(this).data('bcb-button')));
        };

        return this.each(function () {
            var $this = $(this),
                events = $($._data($this[0], 'events'))[0],
                orgEvents;

            var settings = $.extend({}, $.fn.bootstrapConfirmButton.settings, {
                class: $this.data('bcb-class'),
                message: $this.data('bcb-message'),
                cachedMessage: $this.find('.bcb-label').text(),
                sure: function (event) {
                    //now call all events
                    $(orgEvents).each(function (index, click) {
                        click.handler(event);
                    });
                    revert($this);
                }
            }, options);

            $this.data('settings', settings);

            if (events && events.click) {
                orgEvents = $.extend([], events.click);
                $(orgEvents).each(function (index, click) {
                    $this.unbind(click.type, click.handler);
                });
            }


            $this.bind('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                var settings = $(event.currentTarget).data('settings');
                if (!$this.hasClass(settings.class)) {
                    set($this);
                    return;
                }
                settings.sure(event, $this);
            });
        });
    };

    $.fn.bootstrapConfirmButton.settings = {
        class: 'btn-danger',
        message: 'Sure?'
    };


}(jQuery));