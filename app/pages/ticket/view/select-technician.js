define(function(require) {
    var _ = require('underscore'),
        moment = require('moment'),
        Super = require('views/base'),
        Template = require('hbs!./select-technician.tpl'),
        UserTemplate = require('hbs!./select-technician-users.tpl'),
        UserCollection = require('collections/user'),
        Role = require('models/role'),
        Action = require('models/action'),
        Promise = require('bluebird');

    var Page = Super.extend({});
    Page.prototype.initialize = function(options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.users = new UserCollection();
        this.users.comparator = 'name';

        this.minIncomeUser = this.users.max(function(model) {
            return -(model.get('income') || 0);
        });
        this.minTurnsUser = this.users.max(function(model) {
            return -(model.get('turns') || 0);
        });

        this.socket = window.app.socket;
        this.session = window.app.session;
        this.workflow = this.options.container.workflow;
    };

    Page.prototype.render = function() {
        this.$el.html(Template({
            id: this.getId(),
            isOwner: this.session.isOwner
        }));
        this.mapControls();

        var f = function() {
            if (this.session.isOwner) {
                return Promise.all([
                this.users.fetch(),
                this.socket.request({
                    url: '/rest/store/income-of-users',
                    data: {
                        start: this.options.params.start || moment().startOf('day').unix(),
                        end: this.options.params.end || moment().endOf('day').unix(),
                        ticketId: this.options.params.id
                    }
                })]);
            }

            return Promise.all([
            this.users.fetch()]);
        }.bind(this);

        f().spread(function(users, stats) {
            if (stats) {
                //mix stats with users
                _.forEach(stats, function(stat) {
                    var user = this.users.get(stat.technicianId);
                    if (user) {
                        user.set({
                            income: stat.income,
                            turns: stat.turns
                        });
                    }
                }, this);
            }
        }.bind(this)).then(function() {
            this.users.on('all', this.renderUserList.bind(this));
            if (this.session.isOwner) {
                this.sortByIncomeButtonClickHandler();
            }
            else {

                this.users.comparator = function(a, b) {
                    var ret = 0;
                    if (a.get('name') > b.get('name')) {
                        ret = -1; // before
                    }
                    else if (b.get('name') > a.get('name')) {
                        ret = 1;
                    }
                    return ret * -1;
                };

                this.users.sort();
            }

            var events = {};
            events['click .' + this.getId('technician')] = 'technicianButtonClickHandler';
            if (this.session.isOwner) {
                events['click #' + this.controls.sortByIncome.attr('id')] = 'sortByIncomeButtonClickHandler';
                events['click #' + this.controls.sortByTurns.attr('id')] = 'sortByTurnsButtonClickHandler';
                events['click #' + this.controls.sortByName.attr('id')] = 'sortByNameButtonClickHandler';
            }
            this.delegateEvents(events);
        }.bind(this));

    };

    Page.prototype.sortByIncomeButtonClickHandler = function(event) {
        var e, direction;
        if (event) {
            e = $(event.currentTarget);
        }
        else {
            e = this.controls.sortByIncome;
        }
        direction = (parseInt(e.data('direction'), 10) || 1) * -1;

        this.users.comparator = function(model) {
            return direction * model.get('income') || 0;
        };

        this.users.sort();
        e.data('direction', direction);
    };

    Page.prototype.sortByTurnsButtonClickHandler = function(event) {
        var e, direction;
        if (event) {
            e = $(event.currentTarget);
        }
        else {
            e = this.controls.sortByTurns;
        }


        direction = (parseInt(e.data('direction'), 10) || 1) * -1;

        this.users.comparator = function(model) {
            return direction * model.get('turns') || 0;
        };

        this.users.sort();
        e.data('direction', direction);
    };

    Page.prototype.sortByNameButtonClickHandler = function(event) {
        var e, direction;
        if (event) {
            e = $(event.currentTarget);
        }
        else {
            e = this.controls.sortByName;
        }

        direction = (parseInt(e.data('direction'), 10) || 1) * -1;

        this.users.comparator = function(a, b) {
            var ret = 0;
            if (a.get('name') > b.get('name')) {
                ret = -1; // before
            }
            else if (b.get('name') > a.get('name')) {
                ret = 1;
            }
            return direction * ret;
        };

        this.users.sort();
        e.data('direction', direction);
    };


    Page.prototype.renderUserList = function() {
        var users = this.users.map(function(user) {
            return _.extend(user.toJSON(), {
                isMinIncomeUser: _.isObject(this.minIncomeUser) ? user.get('income') == this.minIncomeUser.get('income') : null,
                isMinTurnsUser: _.isObject(this.minTurnsUser) ? user.get('turns') == this.minTurnsUser.get('turns') : null,
                selected: user.id == this.options.params.technician
            });
        }, this);
        this.controls.users.html(UserTemplate({
            users: users,
            id: this.getId(),
            isOwner: this.session.isOwner
        }));
    };

    Page.prototype.technicianButtonClickHandler = function(event) {
        event.preventDefault();
        var e = $(event.currentTarget);
        var model = this.users.get(e.data('id'));

        //make call back to the server to save technician
        var data = {
            technicianId: model.id
        };

        var l = Ladda.create(event.currentTarget);
        l.start();

        Promise.resolve(this.workflow.process(this.options.params.id ? Action.CHANGE_TECHNICIAN : Action.CREATE, this.options.params.id, data)).then(function(resp) {
            this.trigger('created', resp);
        }.bind(this)).
        catch (function(e) {
            console.log(e.statusText);
        }.bind(this)).
        finally(function() {
            l.stop();
        });
    };

    return Page;


});