
/*
 * GET users listing.
 */

module.exports = function(app){
    var controller = app.controllers.product;
    app.get('/rest/product/:id', controller.get);
    app.post('/rest/product', controller.post);
    app.put('/rest/product/:id', controller.put);
    app.delete('/rest/product/:id', controller.delete);
};