/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.index;

    app.post('/index/index', controller.index);
};