var db = require('../db'),
    Workflow = require('../models/workflow'),
    Handlebars = require('handlebars'),
    Promise = require('bluebird'),
    env = process.env.NODE_ENV || 'development',
    _ = require('underscore'),
    moment = require('moment'),
    _s = require('underscore.string');


exports.get = function(req, res, next) {
    var workflow, driver, resp = {};

    Workflow.forge({
        id: req.params.id
    }).fetch().then(function(doc) {
        resp = doc.pick('id', 'name');
        workflow = doc;
        return workflow.getDriver({
            actorId: req.session.userId,
            itemId: req.params.itemId,
            session: req.session
        });
    }).then(function(d) {
        driver = d;
        res.send(200, {
            role: driver.role,
            groups: driver.groups,
            rules: driver.rules
        });
    });
};


exports.process = function(req, res, next) {
    var workflow;
    // console.log('WHAT ABOUT HERE', req.session);
    Workflow.forge({
        id: req.params.id
    }).fetch().then(function(doc) {
        workflow = doc;
        return workflow.getDriver({
            actorId: req.session.userId,
            itemId: req.params.itemId,
            actionId: req.params.actionId,
            session: req.session,
            params: req.body
        });
    }).then(function(driver) {
        return db.transaction(function(transaction) {
            driver.transaction = transaction;
            return driver.process().then(function(result) {
                console.log('execute COMMIT'.green);
                return transaction.commit(result);
            }).
            catch (function(e) {
                console.log('execute ROLLBACK'.red, e);
                return transaction.rollback(e);
            }).
            finally(function() {
                if (driver.transaction) {
                    delete driver.transaction;
                }
            });
        });
    }).then(function(results) {
        res.send(200, results);
    }).
    catch (function(e) {
        console.log("ERROR HERE DUDE: ".red, e);
        res.send(400, e);
    });


};