/*global phantom*/

var _ = require('underscore'),
    Promise = require('bluebird'),
    chai = require('chai'),
    assert = chai.assert,
    expect = chai.expect,
    should = chai.should(),
    page = require('../../../page');

page.open('http://dev.aduyng.com:5000', function() {
    //wait for the page to be loaded
    page.when(function() {
        var val = page.evaluate(function() {
            return window.$ && window.$('html').hasClass('nprogress-busy') > 0;
        });
        return val;
    }).then(function() {
        //wait for the sign page is loaded
        return page.when(function() {
            return page.evaluate(function() {
                return window.$('#action-sign-in').size() !== 0;
            });
        });
    }).then(function() {
        expect(page.evaluate(function() {
            return window.$('input.tel').size() > 0 && window.$('input.pin').size() > 0 && window.$('.login-button').size() > 0;
        })).to.be.ok;

        //click on the login-button
        return page.evaluate(function() {
            return window.$('.login-button').click();
        });

    }).then(function() {
        return page.assertToastMessage('Phone number or PIN is missing!');
    }).then(function() {
        page.evaluate(function() {
            return window.$('input.tel').val('8177606689');
        });
        return page.when(function() {
            return page.evaluate(function() {
                return window.$('.login-button').click();
            });
        }).then(function() {
            return page.assertToastMessage('Phone number or PIN is missing!');
        });
    }).then(function() {
        page.evaluate(function() {
            window.$('input.tel').val('8177606689');
            window.$('input.pin').val('1234');
        });

        return page.when(function() {
            return page.evaluate(function() {
                return window.$('.login-button').click();
            });
        }).then(function() {
            return page.assertToastMessage('PIN is incorrect');
        }).then(function() {
            expect(page.evaluate(function() {
                return window.$('input.pin').val().length === 0;
            })).to.be.ok;
        });
    }).then(function() {
        //fill in the correct phone number and pin
        page.evaluate(function() {
            window.$('input.tel').val('8177606689');
            window.$('input.pin').val('0703');
        });

        return page.when(function() {
            return page.evaluate(function() {
                return window.$('.login-button').click();
            });
        }).then(function() {
            return page.assertToastMessage('You have successfully signed in.');
        });
    }).then(function() {
        phantom.exit();
    });


});