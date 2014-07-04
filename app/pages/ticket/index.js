/*global NProgress*/
define(function(require) {
    var Super = require('views/page'),
        moment = require('moment'),
        _ = require('underscore'),
        Promise = require('bluebird'),
        TicketCollection = require('../../collections/ticket'),
        TicketStatus = require('../../models/ticket-status'),
        TicketListTemplate = require('hbs!./index-ticket-list.tpl'),
        UserCollection = require('collections/user'),
        Template = require('hbs!./index.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.collection = new TicketCollection();
        this.technicians = new UserCollection();
        this.technicians.url = '/rest/store/technicians';
    };

    Page.prototype.render = function() {
        Promise.resolve(function(){
            if( this.session.isOwner ){
                return this.technicians.fetch();
            }
        }.bind(this)).then(function() {
            var params = {
                id: this.id,
                start: this.options.params.start || moment().startOf('day').unix(),
                end: this.options.params.end || moment().endOf('day').unix(),
                ticketStatuses: this.ds.ticketStatuses.map(function(model) {
                    return _.extend(model.toJSON(), {
                        iconClass: model.iconClass,
                        buttonClass: model.buttonClass
                    })
                }),
                isOwner: this.session.isOwner
            };

            if (this.session.isOwner) {
                params.technicians = this.technicians.models;
            }

            this.$el.html(Template(params));

            this.mapControls();


            _.map(this.options.params.stateIds ? this.options.params.stateIds.split(',') : [TicketStatus.PENDING], function(statusId) {
                this.$el.find('.' + this.getId('ticket-status') + '[value=' + statusId + ']').closest('.btn').button('toggle');
            }, this);



            var events = {};
            events['click #' + this.controls.back.attr('id')] = 'backButtonClickHandler';
            events['change .' + this.getId('filter')] = 'filterChangeHandler';
            events['click .' + this.getId('ticket-status-label')] = 'filterChangeHandler';

            this.delegateEvents(events);
            this.collection.on('all', this.draw.bind(this));
            this.refresh().then(this.ready.bind(this));
        }.bind(this));
    };

    Page.prototype.draw = function() {

        this.controls.ticketList.html(TicketListTemplate({
            tickets: this.collection.map(function(model) {
                return _.extend(model.toJSON(), {
                    technician: model.technician,
                    state: model.state
                })
            }, this)
        }));
    };

    Page.prototype.filterChangeHandler = function(event) {
        //get the start and end, update the url then reload
        this.debouncedRefresh();
    };


    Page.prototype.refresh = function() {

        var params = {
            start: moment(this.controls.start.val(), 'YYYY-MM-DD').startOf('day').unix(),
            end: moment(this.controls.end.val(), 'YYYY-MM-DD').endOf('day').unix(),

            stateIds: _.map(this.$el.find('.' + this.getId('ticket-status') + ':checked'), function(element) {
                var e = $(element);
                return e.val();
            }, this)
        };
        if (this.session.isOwner) {
            params.technicianId = this.controls.technician.val();
        }

        NProgress.start();
        return Promise.resolve().then(function() {
            return this.collection.fetch({
                data: params
            })
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