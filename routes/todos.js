/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.todos;
    app.get('/rest/todos/count', controller.count);
    app.get('/rest/todos', controller.get);

};