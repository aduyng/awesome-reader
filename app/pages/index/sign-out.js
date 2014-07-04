define(function (require) {
    var Super = require('views/page');

    var Page = Super.extend({
    });
    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
    };

    Page.prototype.render = function () {
        this.signOut();
    };
    Page.prototype.signOut = function () {
        var f = function(){
            this.session.unset('user');
            this.session.unset('userId');
            app.router.navigate('index/index', {replace: true});
            window.location.reload();
        }.bind(this);
        //making an ajax call to server
        this.socket.request({
            controller: 'user',
            action: 'sign-out',
            success: f,
            error: f
        });
    };

    return Page;


});