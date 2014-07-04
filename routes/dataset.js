/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.dataset;
    app.get('/dataset', controller.get);
};