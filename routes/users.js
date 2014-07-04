/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.users;
    app.get('/rest/users', controller.get);
};