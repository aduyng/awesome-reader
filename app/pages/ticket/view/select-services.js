define(function (require) {
    var _               = require('underscore'),
        Super           = require('views/page'),
        moment          = require('moment'),
        Promise         = require('bluebird'),
        Action          = require('models/action'),
        TaskCollection  = require('collections/task'),
        Template        = require('hbs!./select-services.tpl');

    var Page = Super.extend({
                            });


    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.container = options.container;
        this.categories = this.container.ds.categories;
        this.workflow = options.container.workflow;
        this.ticket = options.ticket;
        this.tasks = options.ticket.tasks;
        console.log(this.tasks);
    };

    Page.prototype.render = function () {
        var params = {
            id        : this.id,
            categories: _.filter(this.categories.map(function (category) {
                var selected = false; 
                var object = {
                    id: category.id,
                    name: category.name,
                    products: category.products.map(function(product){
                        return _.extend(product.toJSON(), {
                                selected: this.tasks ? this.tasks.find(function(task){
                                    if( task.productId == product.id ){
                                        selected = true;
                                        return true;
                                    }
                                    return false;
                                }, this) !== undefined : false
                        });
                    }, this)
                };
                object.selected = selected;
                return object;
            }, this), function (category) {
                return category.products.length > 0;
            }),
            userId    : this.options.params.userId,
            taskId    : this.options.params.id,
            start     : moment().startOf('day').unix(),
            end       : moment().endOf('day').unix()
        };
        
        this.$el.html(Template(params));
        this.mapControls();

        // //base on the tasks, select the appropriate categories and items
        // this.tasks.forEach(function (task) {
        //     var button = this.$el.find('#' + this.getId('product-' + task.get('productId')));
        //     button.addClass('btn-success');
        //     //also expand the category
        //     button.closest('.panel-body').removeClass('hide');

        // }.bind(this));

        var events = {};
        events['click .' + this.getId('category-heading')] = 'categoryHeadingClickHandler';
        events['click .' + this.getId('btn-product')] = 'productButtonClickHandler';
        events['click #' + this.controls.next.attr('id')] = 'nextButtonClickHandler';

        this.delegateEvents(events);

        this.ready();
    };
    
    Page.prototype.productButtonClickHandler = function (event) {
        event.preventDefault();

        var e = $(event.currentTarget);
        e.toggleClass('btn-success');
    };
    Page.prototype.categoryHeadingClickHandler = function (event) {
        var e = $(event.currentTarget);
        this.$el.find('#' + this.getId('category-body-' + e.data('id'))).toggleClass('hide');
    };


    Page.prototype.nextButtonClickHandler = function (event) {
        event.preventDefault();
        //search for all button that has btn-success
        var ids = _.map(this.$el.find('.' + this.getId('btn-product.btn-success')), function (b) {
            return $(b).data('id');
        });

        if (_.isEmpty(ids)) {
            this.toast.error('You must select at least one service!');
            return;
        }


        var l = Ladda.create(event.currentTarget);
        l.start();
        

        Promise.resolve(this.workflow.process(Action.UPDATE_TASKS, this.options.params.id, {productIds: ids}))
            .then(function (resp) {
                      this.trigger('selected', resp);
                  }.bind(this))
            .catch(function (e) {
                       console.log(e.statusText);
                   }.bind(this))
            .finally(function () {
                         l.stop();
                     });


    };

    return Page;


});