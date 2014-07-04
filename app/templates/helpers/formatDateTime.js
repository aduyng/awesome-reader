/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
define('templates/helpers/formatDateTime', ['hbs/handlebars', 'moment'], function (Handlebars, moment) {
    var f = function (input) {
        if( /\d+/.test(input)){
            return moment.unix(input).format('MM/DD/YYYY hh:mm:ss A');
        }
        return moment(input).format('MM/DD/YYYY hh:mm:ss A');

    };
    Handlebars.registerHelper('formatDateTime', f);

    return f;
});