var Super                                   = require('./base'),
    _                                       = require('underscore'),
    _s                                      = require('underscore.string'),
    moment                                  = require('moment'),
    Promise                                 = require('bluebird'),
    Handlebars                              = require('handlebars'),
    WorkflowItemUserRoleCollection          = require('../collections/workflow-item-user-role'),
    WorkflowTodoTemplate                    = require('./workflow-todo-template'),
    WorkflowFeedTemplate                    = require('./workflow-feed-template'),
    WorkflowActivityTemplate                = require('./workflow-activity-template'),
    WorkflowTaskType                        = require('./workflow-task-type'),
    Todo                                    = require('./todo'),
    Feed                                    = require('./feed'),
    Activity                                = require('./activity'),
    Model                                   = Super.extend({
                                                tableName: 'WorkflowRuleTask'
                                            });

Model.prototype.execute = function (driver) {
    this.driver = driver;
    this.transaction = driver.transaction;
    //TODO: check if the acl is satisfied

    //depending on the taskType to execute appropriate tasks
    switch (this.taskType) {
        
        case WorkflowTaskType.CREATE_TODO:
            return this.createTodo();

        case WorkflowTaskType.CREATE_FEED:
            return this.createFeed();

        case WorkflowTaskType.CREATE_ACTIVITY:
            return this.createActivity();
            
        case WorkflowTaskType.CLEAR_TODO:
            return this.clearTodo();
            
        default:
            return Promise.reject(Handlebars.compile('Task type: {{taskType}} is not supported!')({
                                                taskType: this.taskType
                                                }).red);

    }
};


Model.prototype.createActivity = function () {
    var template, item = this.driver.workflowItem;
    //get the template first
    return this.getTemplate()
        .then(function (t) {
                  template = t;
              }.bind(this))
        .then(function () {
                  return Promise.all([
                                         this.driver.substitutePlaceholders(template.get('title')),
                                         this.driver.substitutePlaceholders(template.get('description')),
                                         this.driver.getItemViewUrl()
                                     ])
                      .spread(function (title, description, viewUrl) {
                                  return Activity.forge({
                                                        dateCreated: this.driver.params.now || moment().unix(),
                                                        title      : title,
                                                        description: description,
                                                        userId     : this.driver.actor.id,
                                                        url        : viewUrl,
                                                        itemId     : item.id,
                                                        roleId     : this.driver.role.id
                                                    })
                                      .save(null, {transacting: this.transaction})
                                      .then(function(doc){
                                              console.log(Handlebars.compile('Activity created:')({
                                                }).cyan, doc.toJSON());
                                          });
                              }.bind(this));


              }.bind(this))
        ;
};
Model.prototype.createFeed = function () {
    var template, item = this.driver.workflowItem;
    //get the template first
    return this.getTemplate()
        .then(function (t) {
                  template = t;
                  return this.getRecipientIds(item.id);
              }.bind(this))
        .then(function (recipientIds) {
                  return Promise.all(_.map(recipientIds, function (recipientId) {
                      return Promise.all([
                                             this.driver.substitutePlaceholders(template.get('title')),
                                             this.driver.substitutePlaceholders(template.get('description')),
                                             this.driver.getItemViewUrl()
                                         ])
                          .spread(function (title, description, viewUrl) {
                                        return Feed.forge({
                                                            dateCreated: this.driver.params.now || moment().unix(),
                                                            title      : title,
                                                            description: description,
                                                            userId     : recipientId,
                                                            url        : viewUrl,
                                                            itemId     : item.id,
                                                            roleId     : this.driver.role.id
                                                        })
                                          .save(null, {transacting: this.transaction})
                                          .then(function(feed){
                                              console.log(Handlebars.compile('Feed created:')({
                                                }).cyan, feed.toJSON());
                                          });
                                  }.bind(this));
                  }, this));

        }.bind(this));
};


Model.prototype.createTodo = function () {
    var template, item = this.driver.workflowItem;
    //get the template first
    return this.getTemplate()
        .then(function (t) {
                  template = t;
                  return this.getRecipientIds(item.id);
              }.bind(this))
        .then(function (recipientIds) {
                  return Promise.all(_.map(recipientIds, function (recipientId) {
                      return Promise.all([
                                             this.driver.substitutePlaceholders(template.get('title')),
                                             this.driver.substitutePlaceholders(template.get('description')),
                                             this.driver.getItemViewUrl()
                                         ])
                          .spread(function (title, description, viewUrl) {
                                      return Todo.forge({
                                                            dateCreated: this.driver.params.now || moment().unix(),
                                                            title      : title,
                                                            description: description,
                                                            userId     : recipientId,
                                                            url        : viewUrl,
                                                            itemId     : item.id,
                                                            roleId     : this.driver.role.id
                                                        })
                                          .save(null, {transacting: this.transaction})
                                          .then(function(doc){
                                              console.log(Handlebars.compile('Todo created:')({
                                                }).cyan, doc.toJSON());
                                          });
                                  }.bind(this));

                  }, this));

              }.bind(this))
        ;
};


Model.prototype.clearTodo = function () {
    var template, item = this.driver.workflowItem;
    //get the template first
    return Promise.resolve()
        .then(function (t) {
                  return this.getRecipientIds(item.id);
              }.bind(this))
        .then(function (recipientIds) {
            if( recipientIds ){
                  return Promise.all(_.map(recipientIds, function (recipientId) {
                        return Todo.forge({
                          userId: recipientId,
                          itemId: item.id
                        })
                        .fetch({transacting: this.transaction})
                        .then(function(todo){
                            if( todo ){
                                return todo.destroy({transacting: this.transaction});
                            }
                        })
                        .then(function(){
                          console.log(Handlebars.compile('Todo deleted for userId {{id}}:')({
                              id: recipientId
                                                }).cyan);
            
                        }.bind(this));
                  }, this));
            }
            return Promise.resolve();
        }.bind(this));
};

Model.prototype.getTemplate = function () {
    return Promise.resolve()
        .then(function(){
            switch (this.taskType) {
                case WorkflowTaskType.CREATE_TODO:
                    return WorkflowTodoTemplate.forge({id: this.templateId}).fetch();
                case WorkflowTaskType.CREATE_FEED:
                    return WorkflowFeedTemplate.forge({id: this.templateId}).fetch();
                case WorkflowTaskType.CREATE_ACTIVITY:
                    return WorkflowActivityTemplate.forge({id: this.templateId}).fetch();
            }    
        }.bind(this))
        .then(function(template){
            if( !template ){
                console.log(Handlebars.compile('Template id: {{templateId}} is NOT found!')({
                                                }).red);
                                                
                return Promise.reject('Template id ' + this.templateId + ' for taskType = ' + this.taskType + ' is NOT found!');
            }
            return template;
        }.bind(this));
    
};

Model.prototype.getRecipientIds = function (itemId) {
    var taskId = this.id;
    return WorkflowItemUserRoleCollection.forge()
        .query()
        .distinct('userId')
        .transacting(this.driver.transaction)
        .where('WorkflowItemUserRole.itemId', itemId)
        .whereIn('WorkflowItemUserRole.roleId', function () {
                     this.select('roleId')
                         .from('WorkflowGroupRole')
                         .whereIn('groupId', function () {
                                      this.select('groupId')
                                          .from('WorkflowRuleTaskRecipient')
                                          .where('taskId', taskId);
                                  });
                 })
        .select()
        .then(function (rows) {
            
                if( rows && rows.length > 0){
                    var ids = _.pluck(rows, 'userId');
                    
                    console.log(Handlebars.compile('There are {{ids.length}} recipients ([{{list}}])  found.')({
                        ids: ids,
                        list: ids.join(', ')
                        
                                                    }).cyan);
                                                    
                    return ids;
                }else{
                    console.log(Handlebars.compile('There are NO recipients found for task {{id}}.')({
                        id: this.id
                                                    }).yellow);
                }
              }.bind(this));
};

Object.defineProperty(Model.prototype, 'taskType', {
    get: function () {
        var v = this.get('taskType');
        if(!_.isNumber(v) ){
            v = parseInt(v, 10);
            this.set('taskType', v);
        }
        return v;
    }
});

Object.defineProperty(Model.prototype, 'templateId', {
    get: function () {
        return this.get('templateId');
    }
});




module.exports = Model;

