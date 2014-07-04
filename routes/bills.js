/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.bills;
    app.get('/rest/bills', controller.get);
};