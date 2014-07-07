/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.feed;

    app.get('/feed/parse-info', controller.parseInfo);
    app.post('/feed', controller.post);
    app.put('/feed/:id', controller.put);
    app.delete('/feed/:id', controller.delete);
};