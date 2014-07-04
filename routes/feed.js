/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.feed;
    app.put('/rest/feed/:id', controller.put);
};