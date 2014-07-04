/*global NProgress*/
define(function(require) {
    var Super = require('views/page'),
        moment = require('moment'),
        _ = require('underscore'),
        Promise = require('bluebird'),
        BillCollection = require('../../collections/bill'),
        BillStatus = require('../../models/bill-status'),
        BillListTemplate = require('hbs!./index-bill-list.tpl'),
        Template = require('hbs!./index.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.collection = new BillCollection();
    };

    Page.prototype.render = function() {
        var params = {
            id: this.id,
            
            billStatuses: this.ds.billStatuses.map(function(model) {
                return _.extend(model.toJSON(), {
                    iconClass: model.iconClass,
                    buttonClass: model.buttonClass
                })
            }),
            isOwner: this.session.isOwner
        };
        
        if( this.session.isOwner ){
            _.extend(params, {start: this.options.params.start || moment().startOf('day').unix(),
            end: this.options.params.end || moment().endOf('day').unix()});
        }


        this.$el.html(Template(params));

        this.mapControls();


        _.map(this.options.params.stateIds ? this.options.params.stateIds.split(',') : [BillStatus.PENDING], function(statusId) {
            this.$el.find('.' + this.getId('bill-status') + '[value=' + statusId + ']').closest('.btn').button('toggle');
        }, this);



        var events = {};
        events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';
        events['click .' + this.getId('bill-status-label')] = 'filterChangeHandler';
        if (this.session.isOwner) {
            events['change .' + this.getId('filter')] = 'filterChangeHandler';
            
        }

        this.delegateEvents(events);
        this.collection.on('all', this.draw.bind(this));
        this.refresh().then(this.ready.bind(this));

    };

    Page.prototype.draw = function() {

        this.controls.billList.html(BillListTemplate({
            bills: this.collection.map(function(model) {
                return _.extend(model.toJSON(), {
                    state: model.state,
                    customer: model.customer
                });
            }, this)
        }));
    };

    Page.prototype.filterChangeHandler = function(event) {
        //get the start and end, update the url then reload
        this.debouncedRefresh();
    };


    Page.prototype.refresh = function() {

        var params = {
            stateIds: _.map(this.$el.find('.' + this.getId('bill-status') + ':checked'), function(element) {
                var e = $(element);
                return e.val();
            }, this)
        };
        if( this.session.isOwner ){
            _.extend(params, {
                start: moment(this.controls.start.val(), 'YYYY-MM-DD').startOf('day').unix(),
                end: moment(this.controls.end.val(), 'YYYY-MM-DD').endOf('day').unix()
            });
        }else{
            _.extend(params, {
                start: moment().startOf('day').unix(),
                end: moment().endOf('day').unix()
            });
        }
        
        NProgress.start();
        return Promise.resolve().then(function() {
            NProgress.inc();
            return this.collection.fetch({
                data: params
            });
        }.bind(this)).
        finally(function() {
            NProgress.done();
            this.goTo(params, {
                replace: true
            });
        }.bind(this));
    };

    Page.prototype.debouncedRefresh = _.debounce(Page.prototype.refresh, 300);

    return Page;


});