/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
define('templates/helpers/formatTicketStatusClass', ['hbs/handlebars', '../../models/ticket-status'], function (Handlebars, TicketStatus) {
    var f = function (input) {
        switch(parseInt(input, 10)){
            case TicketStatus.PAID:
                return 'default';
            case TicketStatus.BILLED:
                return 'info';
            default:
                return 'warning';
        }
    };
    Handlebars.registerHelper('formatTicketStatusClass', f);

    return f;
});