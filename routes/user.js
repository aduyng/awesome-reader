
/*
 * GET users listing.
 */

module.exports = function(app){
    var controller = app.controllers.user;
    app.post('/user/sign-in', controller.signIn);
    app.post('/user/availability', controller.availability);
    app.post('/user/register', controller.register);
    
    //required to signed in 
    app.get('/user/sign-out', controller.signOut);
    app.get('/rest/user/:id/stores', controller.stores);
    
    //REST
    app.get('/rest/user/:id', controller.get);
    app.delete('/rest/user/:id', controller.delete);
    app.put('/rest/user/:id', controller.put);
    
};