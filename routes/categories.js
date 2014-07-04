/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.categories;
    app.get('/rest/categories', controller.get);
};