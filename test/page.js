var _ = require('underscore'),
    Promise = require('bluebird'),
    chai = require('chai'),
    expect = chai.expect,
    webpage = require('webpage');


var page = webpage.create();
page.settings.resourceTimeout = 60000; // 60 seconds

page.when = function(truthTest) {
    return new Promise(function(resolve, reject) {
        var f = function() {
            if (truthTest()) {
                resolve();
                return;
            }
            setTimeout(f, 0);
        }
        f();
    });
};

page.assertToastMessage = function(expected) {
    var $this = page;
    return $this.when(function() {
        return $this.evaluate(function() {
            return window.$('#toast-container').size() > 0;
        });
    }).then(function() {
        expect($this.evaluate(function() {
            return window.$(window._.last(window.$('.toast-message'))).text();
        })).to.equal(expected);
    }).then(function() {
        return $this.when(function() {
            return $this.evaluate(function() {
                return window.$('.toast-message').size() === 0;
            });
        });
    });
};

module.exports = page;