/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
define('templates/helpers/formatDate', ['hbs/handlebars', 'moment'], function (Handlebars, moment) {
    var f = function (input) {
        if( /\d+/.test(input)){
            return moment.unix(input).format('MM/DD/YYYY');
        }
        return moment(input).format('MM/DD/YYYY');

    };
    Handlebars.registerHelper('formatDate', f);

    return f;
});