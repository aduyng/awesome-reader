
/*
 * GET users listing.
 */

module.exports = function(app){
    var controller = app.controllers.report;
    app.get('/report/income/start-date/:startDate/end-date/:endDate', controller.income);

};