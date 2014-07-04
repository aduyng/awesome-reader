/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.feeds;

    app.get('/feeds', controller.get);
};