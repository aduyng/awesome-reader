/*global Backbone, _*/

define(function(require) {
    var Super = require('views/page'),
        moment = require('moment'),
        Template = require('hbs!./daily-summary.tpl'),
        ResultTemplate = require('hbs!./daily-summary-results.tpl'),
        TechnicianTemplate = require('hbs!./daily-summary-technician.tpl'),
        Promise = require('bluebird'),
        Role = require('models/role');

    var Page = Super.extend({});
    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        if( this.session.isOwner ){
            this.users = new Backbone.Collection();
            this.users.url = '/rest/store/technicians';
    
            this.stats = new Backbone.Collection();
            this.stats.url = '/rest/store/summary-of-income';
            
            this.payments = new Backbone.Collection();
            this.payments.url = '/rest/store/summary-of-payments';
            
            this.billStat = new Backbone.Model();
            this.billStat.url = '/rest/store/summary-of-bills';
        }else{
            this.stat = new Backbone.Model();
            this.stat.url = '/rest/store/summary-of-technician';
        }
    };

    Page.prototype.render = function() {
        
        this.$el.html(Template({
            id: this.id,
            date: moment().unix(),
            isOwner: this.session.isOwner
        }));

        this.mapControls();

        var events = {};
        events['click ' + this.toId('back')] = 'backButtonClickHandler';
        
        if( this.session.isOwner ){
            events['click ' + this.toId('date')] = 'dateChangeHandler';
        }
        
        this.delegateEvents(events);

        Promise.resolve(this.refresh()).then(this.ready.bind(this));

        
    };

    Page.prototype.dateChangeHandler = function(event) {
        this.refresh();
    };


    Page.prototype.refresh = function() {
        var date, params = {
        };
        if( this.session.isOwner ){
            date = moment(this.controls.date.val()).unix();
        }else{
            date = moment().unix();
        }
        
        params.start = moment.unix(date).startOf('day').unix();
        params.end = moment.unix(date).endOf('day').unix();
        
        if (this.session.isOwner) {
            return Promise.all([
            this.users.fetch({
                data: params
            }), this.stats.fetch({
                data: params
            }), this.payments.fetch({
                data: params
            }), this.billStat.fetch({
                data: params
            })]).spread(function() {
                var technicians = this.users.map(function(user) {
                    var stat = this.stats.find(function(s) {
                        return s.get('technicianId') == user.id;
                    });
        
                    var ret = user.pick('id', 'name');
        
                    if (stat) {
                        _.extend(ret, stat.toJSON(), {
                            profit: parseFloat(stat.get('gross')) - parseFloat(stat.get('net'))
                        });
                    }
                    return ret;
                }, this);
        
                var store = {
                    gross: this.stats.reduce(function(memo, stat) {
                        return memo + parseFloat(stat.get('gross'));
                    }, 0, this) || 0,
                    net: this.stats.reduce(function(memo, stat) {
                        return memo + (parseFloat(stat.get('gross')) - parseFloat(stat.get('net')));
                    }, 0, this) || 0
                };
        
                store.profit = store.gross - store.net;
                _.extend(store, this.billStat.toJSON());
        
                var payments = this.payments.map(function(payment) {
                    return {
                        name: this.ds.paymentCategories.get(payment.get('paymentCategoryId')).name,
                        id: payment.get('paymentCategoryId'),
                        total: parseFloat(payment.get('total'))
                    };
                }, this);
        
                this.controls.results.html(ResultTemplate({
                    technicians: technicians,
                    store: store,
                    payments: payments
                }));
            }.bind(this));
        }
        
        return Promise.resolve(this.stat.fetch({
            data: params
        }))
            .then(function(){
                console.log(this.stat.toJSON());
                this.controls.results.html(TechnicianTemplate({
                    stat: this.stat.toJSON()
                }));
            }.bind(this));
    }

    return Page;


});
