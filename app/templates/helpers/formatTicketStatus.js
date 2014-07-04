/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
define('templates/helpers/formatTicketStatus', ['hbs/handlebars', 'moment'], function (Handlebars, moment) {
    var f = function (input) {
        var status = window.app.ds.ticketStatuses.get(input);
        if (status) {
            return status.get('name');
        }
    };

    Handlebars.registerHelper('formatTicketStatus', f);

    return f;
});