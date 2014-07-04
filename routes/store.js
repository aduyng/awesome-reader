/*
 * GET home page.
 */

module.exports = function (app) {
    var controller = app.controllers.store;
    
    app.get('/rest/store/income-of-users', controller.incomeOfUsers);
    app.get('/rest/store/technicians', controller.technicians);
    app.get('/rest/store/summary-of-income', controller.summaryOfIncome);
    app.get('/rest/store/summary-of-payments', controller.summaryOfPayments);
    app.get('/rest/store/summary-of-bills', controller.summaryOfBills);
    app.get('/rest/store/summary-of-technician', controller.summaryOfTechnician);
    
    app.get('/rest/store/:id', controller.get);
    app.put('/rest/store/:id', controller.put);
    
};