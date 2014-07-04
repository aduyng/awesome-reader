/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.workflow;
    app.get('/rest/workflow/:id', controller.get);
    app.get('/rest/workflow/:id/item/:itemId', controller.get);
    app.post('/rest/workflow/:id/action/:actionId', controller.process);
    app.post('/rest/workflow/:id/action/:actionId/item/:itemId', controller.process);
};