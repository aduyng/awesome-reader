/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
define('templates/helpers/fromNow', ['hbs/handlebars', 'moment'], function (Handlebars, moment) {
    var f = function (input) {
        if( /\d+/.test(input)){
            return moment.unix(input).fromNow();
        }

        return moment(input).fromNow();
    };
    Handlebars.registerHelper('fromNow', f);

    return f;
});