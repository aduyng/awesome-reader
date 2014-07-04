
/*
 * GET users listing.
 */

module.exports = function(app){
    var controller = app.controllers.role;
    app.get('/role/list', controller.roleList);


};