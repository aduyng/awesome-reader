define(function (require) {
    var Super = require('views/page'),
        Collection = require('collections/todo'),
        Template = require('hbs!./index.tpl'),
        Promise = require('bluebird'),
        ListTemplate = require('hbs!./index-list-template.tpl');

    var Page = Super.extend({
                            });
    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.collection = new Collection();
        this.page = 0;
        this.perPage = 10;
    };

    Page.prototype.render = function () {
        this.$el.html(Template({
                                   id: this.id
                               }));
        this.mapControls();
        this.collection.on('all', this.renderFeeds.bind(this));
        this.fetch();

        var events = {};
        events['click #' + this.getId('load-more')] = 'loadMoreClickHandler';
        this.delegateEvents(events);

        this.ready();
    };


    Page.prototype.loadMoreClickHandler = function (event) {
        event.preventDefault();

        this.page++;
        this.fetch();
    };


    Page.prototype.fetch = function () {
        this.controls.loadMore.attr('disabled', 'disabled');
        var length = this.collection.length;

        return Promise.resolve(
            this.collection.fetch({
                                      remove: false,
                                      data  : {
                                          page   : this.page,
                                          perPage: this.perPage
                                      }
                                  }))
            .finally(function () {
                         this.controls.loadMore.removeAttr('disabled');
                         if (this.collection.length < length + this.perPage) {
                             //no more rows to fetch
                             this.controls.loadMore.attr('disabled', 'disabled');
                             this.controls.loadMore.text('No more items to load.');
                         }
                     }.bind(this));
    };

    Page.prototype.renderFeeds = function () {
        this.controls.list.html(ListTemplate({
                                                 items: this.collection.toJSON()
                                             }));

    };

    Page.prototype.cleanUp = function () {
        this.collection.off('all', this.renderFeeds);
    };

    return Page;


});