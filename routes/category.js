
/*
 * GET users listing.
 */

module.exports = function(app){
    var controller = app.controllers.category;
    app.get('/rest/category/:id', controller.get);
    app.post('/rest/category', controller.post);
    app.put('/rest/category/:id', controller.put);
    app.delete('/rest/category/:id', controller.delete);
    
};