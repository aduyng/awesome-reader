/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.feed;

    app.get('/feed/parse-info', controller.parseInfo);
};