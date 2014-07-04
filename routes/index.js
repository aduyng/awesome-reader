/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.index;

    app.post('/index/pages/index', controller.pageIndex);
    app.post('/index/pages/sign-out', controller.pageSignOut);
    app.post('/index/pages/sign-in', controller.pageSignIn);
    app.get('/index/config', controller.config);

};