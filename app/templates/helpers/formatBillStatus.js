/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
define('templates/helpers/formatBillStatus', ['hbs/handlebars', 'moment'], function (Handlebars, moment) {
    var f = function (input) {
        var status = window.app.ds.billStatuses.get(input);
        if (status) {
            return status.get('name');
        }
    };

    Handlebars.registerHelper('formatBillStatus', f);

    return f;
});