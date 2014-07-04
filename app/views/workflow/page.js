define(function (require) {
    var Super = require('views/page'),
        Workflow = require('models/workflow'),
        ActionPanel = require('./panel/action'),
        Promise = require('bluebird');

    var Page = Super.extend({
                            });
    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.workflow = new Workflow({
                                         id: this.getWorkflowId()
                                     });

    };

    Page.prototype.getWorkflowId = function () {
        throw new Error("child class must implement getWorkflowId()");
    };
    Page.prototype.getCreateViewClass = function () {
        throw new Error("child class must implement getCreateViewClass()");
    };

    Page.prototype.getTemplate = function () {
        throw new Error("child class must implement getTemplate() to return a template with create-container and edit-container");
    };


    Page.prototype.render = function () {
        this.$el.html(this.getTemplate()({
                                             id: this.getId()
                                         }));
        this.mapControls();

        var done = function () {
            this.ready();
        }.bind(this);

        Promise.resolve(this.workflow.fetch({
                                                data: {
                                                    itemId: this.options.params.id
                                                }
                                            }))
            .then(function () {
                      if (!this.params.id) {
                          Promise.all([this.initCreate(), this.initActionPanel()])
                              .then(done);
                      } else {
                          Promise.all([this.initEdit(), this.initActionPanel()])
                              .then(done);
                      }
                  }.bind(this));
    };
    
    

    Page.prototype.initCreate = function () {
        var opts = _.extend({}, this.options, {
            el      : this.controls.create,
            workflow: this.workflow
        });
        var CreateViewClass = this.getCreateViewClass();

        this.controls.createView = new CreateViewClass(opts);
        this.controls.createView.render();
        
        this.controls.createView.on('created', this.createHandler.bind(this));
        
        return Promise.resolve();
    };
    
    Page.prototype.createHandler = function(result){
        this.reload({id: result.id});
    };

    Page.prototype.initEdit = function () {
        throw new Error("child class must implement initEdit() and return a Promise");
    };


    Page.prototype.initActionPanel = function () {
        var opts = _.extend({}, this.options, {
            workflow: this.workflow,
            el      : this.controls.actionPanel

        });

        this.controls.actionPanel = new ActionPanel(opts);
        this.controls.actionPanel.render();
    };

    return Page;


});