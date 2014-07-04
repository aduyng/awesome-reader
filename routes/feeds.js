/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.feeds;
    app.get('/rest/feeds/count', controller.count);
    app.get('/rest/feeds', controller.get);
};