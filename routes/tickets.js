/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.tickets;
    app.get('/rest/tickets', controller.get);
};