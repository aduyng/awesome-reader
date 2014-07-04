var db = require('../../db'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    Promise = require('bluebird'),
    Handlebars = require('handlebars'),
    Role = require('../role'),
    User = require('../user'),
    Action = require('../action'),
    AppError = require('../../error'),
    WorkflowItemUserRole = require('../workflow-item-user-role'),
    WorkflowGroupRole = require('../workflow-group-role'),
    WorkflowRuleActorGroup = require('../workflow-rule-actor-group'),
    WorkflowGroupCollection = require('../../collections/workflow-group'),
    WorkflowRule = require('../workflow-rule'),
    WorkflowRuleCollection = require('../../collections/workflow-rule'),
    WorkflowRuleTaskCollection = require('../../collections/workflow-rule-task'),
    WorkflowMethod = require('../workflow-method'),
    WorkflowItem = require('../workflow-item');

var Model = db.Model.extend({
    tableName: 'Base'
});

Model.prototype.init = function(options) {
    if (options.session) {
        this.session = options.session;
    }
    if (options.params) {
        this.params = options.params;
    }

    this.workflow = options.workflow;

    return Promise.resolve().then(function() {
        return this.getActor(options.actorId);
    }.bind(this)).then(function() {
        return Promise.all([this.getItem(options.itemId), this.getAction(options.actionId)]);
    }.bind(this)).then(function() {
        return this.getWorkflowItem();
    }.bind(this)).then(function() {
        return this.getRole();
    }.bind(this)).then(function() {
        return this.getGroups();
    }.bind(this)).then(function() {
        return this.getMatchingRules();
    }.bind(this));
};


Model.prototype.getItem = function() {
    throw new Error("Child class must implement getItem()");
};

Model.prototype.getWorkflowItem = function() {
    if (this.item) {
        if (!this.workflowItem) {

            return WorkflowItem.forge({
                itemId: this.item.id,
                workflowId: this.workflow.id
            }).fetch().then(function(w) {
                this.workflowItem = w;
                return Promise.resolve(this.workflowItem);
            }.bind(this));
        }
        return Promise.resolve(this.workflowItem);
    }
    return Promise.resolve();
};

Model.prototype.getActor = function(actorId) {
    if (!actorId) {
        return Promise.resolve();
    }


    if (!this.actor) {
        return User.forge({
            id: actorId
        }).fetch().then(function(w) {
            this.actor = w;
            return Promise.resolve(this.actor);
        }.bind(this));
    }
    return Promise.resolve(this.actor);
};

Model.prototype.getAction = function(actionId) {
    if (!actionId) {
        return Promise.resolve();
    }


    if (!this.action) {
        Action.forge({
            id: actionId
        }).fetch().then(function(w) {
            this.action = w;
            return Promise.resolve(this.action);
        }.bind(this));
    }
    return Promise.resolve(this.action);
};


Model.prototype.getMatchingRules = function() {
    if (!this.groups || this.groups.length === 0) {
        return Promise.resolve();
    }
    if (this.rules) {
        return Promise.resolve(this.rules);
    }

    return WorkflowRuleCollection.forge().query(function(qb) {
        qb.join('WorkflowRuleActorGroup', 'WorkflowRuleActorGroup.ruleId', '=', 'WorkflowRule.id').whereIn('WorkflowRuleActorGroup.groupId', this.groups.pluck('id'));
        if (this.action) {
            qb.where('WorkflowRule.actionId', this.action.id);
        }
        if (this.workflowItem) {
            qb.where('WorkflowRule.stateId', this.workflowItem.stateId);
        }
        qb.where('WorkflowRule.workflowId', this.workflow.id);
    }.bind(this)).fetch().then(function(docs) {
        this.rules = docs;
        return Promise.resolve(this.rules);
    }.bind(this));

};


Object.defineProperty(Model.prototype, 'action', {
    get: function() {
        return this.get('action');
    },
    set: function(val) {
        this.set('action', val);
        return this;
    }
});


Object.defineProperty(Model.prototype, 'item', {
    get: function() {
        return this.get('item');
    },
    set: function(val) {
        this.set('item', val);
        return this;
    }
});

Object.defineProperty(Model.prototype, 'session', {
    get: function() {
        return this.get('session');
    },
    set: function(val) {
        this.set('session', val);
        return this;
    }
});

Object.defineProperty(Model.prototype, 'workflowItem', {
    get: function() {
        return this.get('workflowItem');
    },
    set: function(val) {
        this.set('workflowItem', val);
        return this;
    }
});

Object.defineProperty(Model.prototype, 'role', {
    get: function() {
        return this.get('role');
    },
    set: function(val) {
        this.set('role', val);
        return this;
    }
});

Object.defineProperty(Model.prototype, 'actor', {
    get: function() {
        return this.get('actor');
    },
    set: function(val) {
        this.set('actor', val);
        return this;
    }
});

Object.defineProperty(Model.prototype, 'groups', {
    get: function() {
        return this.get('groups');
    },
    set: function(val) {
        this.set('groups', val);
        return this;
    }
});
Object.defineProperty(Model.prototype, 'rules', {
    get: function() {
        return this.get('rules');
    },
    set: function(val) {
        this.set('rules', val);
        return this;
    }
});
Model.prototype.getGroups = function() {
    if (!this.groups) {
        if (!this.role) {
            return Promise.resolve();
        }

        return this.getGroupsContainRoles([this.role]).then(function(groups) {
            this.groups = groups;
            return Promise.resolve(this.groups);
        }.bind(this));
    }
    return Promise.resolve(this.groups);
};

Model.prototype.getGroupsContainRoles = function(roles) {
    if (!roles || roles.length == 0) {
        return Promise.resolve();
    }

    return WorkflowGroupCollection.forge().query(function(qb) {
        qb.join('WorkflowGroupRole', 'WorkflowGroupRole.groupId', '=', 'WorkflowGroup.id').whereIn('WorkflowGroupRole.roleId', roles.map(function(role) {
            return role.id;
        }));
    }).fetch();
};

Model.prototype.getRole = function() {
    if (this.role) {
        return Promise.resolve(this.role);
    }
    // console.log('-->Role is OK');
    //if there is an item id, then use it for fetching the role of the current user
    if (this.actor) {
        // console.log('-->Found actor');
        if (this.workflowItem) {
            // console.log('-->Found workflowItem');
            return Role.forge().query(function(qb) {
                qb.join('WorkflowItemUserRole', 'WorkflowItemUserRole.roleId', '=', 'Role.id').join('WorkflowItem', 'WorkflowItem.id', '=', 'WorkflowItemUserRole.itemId').where('WorkflowItem.workflowId', this.workflow.id).where('WorkflowItemUserRole.itemId', this.workflowItem.id).where('WorkflowItemUserRole.userId', this.actor.id);
            }.bind(this)).fetch().then(function(doc) {
                this.role = doc;
                return Promise.resolve(this.role);
            }.bind(this));
        }
        else {
            // console.log('-->Found workflowItem');
        }
        return Role.forge({
            id: Role.AUTHENTICATED_USER
        }).fetch().then(function(doc) {
            this.role = doc;
            return Promise.resolve(this.role);
        }.bind(this));

    }

    return Role.forge({
        id: Role.UNAUTHENTICATED_USER
    }).fetch().then(function(doc) {
        this.role = doc;
        return Promise.resolve(this.role);
    }.bind(this));

};


Model.prototype.initWorkflowItem = function(rule) {
    return WorkflowItem.forge({
        workflowId: this.workflow.id,
        itemId: this.item.id,
        stateId: rule.postStateId
    }).save(null, {
        transacting: this.transaction
    }).then(function(workflowItem) {
        this.workflowItem = workflowItem;
    }.bind(this));
};

Model.prototype.substitutePlaceholders = function(expr) {
    //    console.log('substitutePlaceholders for ', expr);
    if (!expr || expr.length === 0) {
        return expr;
    }

    //extract expression with {{name}}
    var placeholders = expr.match(/\{{2,3}(.+?)\}{2,3}/g);
    var values = {};
    return Promise.all(_.map(placeholders, function(placeholder) {
        var key = placeholder.replace(/\{{2,3}/, '').replace(/\}{2,3}/, '');
        return this.evaluateExpression(key).then(function(value) {
            return {
                key: key,
                value: value
            };
        });
    }.bind(this))).then(function(evaluatedExpressions) {
        _.forEach(evaluatedExpressions, function(ee) {
            values[ee.key] = ee.value;
        });

        return Handlebars.compile(expr)(values);
    });
};

Model.prototype.getItemViewUrl = function() {
    return _s.dasherize(this.workflow.get('driverClass')).replace(/^-/, '') + '/view/id/' + this.item.id;

};

Model.prototype.evaluateExpression = function(key) {
    if (!this.evaluatedValues) {
        this.evaluatedValues = {};
    }

    if (this.evaluatedValues[key] !== undefined) {


        return Promise.resolve(this.evaluatedValues[key]);
    }

    //TODO: make sure that the key is a method presented
    return WorkflowMethod.forge().query(function(qb) {
        var workflowId = this.workflow.id;
        qb.where(function() {
            this.where('workflowId', workflowId).orWhere('workflowId', null);
        });
        qb.where('name', key);
    }.bind(this)).fetch().then(function(method) {
        if (!method) {
            console.log(Handlebars.compile('Evaluating fail! {{workflow.driverClass}}::{{method}} is not registered!')({
                workflow: this.workflow,
                method: key
            }).yellow);

            return Promise.reject(Handlebars.compile('Method {{name}} is not registered!')({
                name: key
            }));
        }

        if (!this[key]) {
            console.log(Handlebars.compile('Evaluating fail! {{workflow.driverClass}}::{{method}} is not found!')({
                workflow: this.workflow,
                method: key
            }).yellow);

            return Promise.reject(Handlebars.compile('Method {{name}} is not found!')({
                name: key
            }));

        }

        if (this.evaluatedValues[key] !== undefined) {
            return this.evaluatedValues[key];
        }

        return Promise.resolve(this[key]()).then(function(value) {
            this.evaluatedValues[key] = method.get('returnValueType') == 'boolean' ? (value ? true : false) : value;
            return this.evaluatedValues[key];
        }.bind(this));
    }.bind(this));
};

Model.prototype.id = function() {
    return Promise.resolve(this.item.id);
};

Model.prototype.actorName = function() {
    return Promise.resolve(this.actor.get('name'));
};


Object.defineProperty(Model.prototype, 'params', {
    get: function() {
        return this.get('params');
    },
    set: function(val) {
        this.set('params', val);
        return this;
    }
});


Object.defineProperty(Model.prototype, 'workflow', {
    get: function() {
        return this.get('workflow');
    }
});

Object.defineProperty(Model.prototype, 'transaction', {
    get: function() {
        return this.get('transaction');
    },
    set: function(val) {
        this.set('transaction', val);
        return this;
    }

})

Model.prototype.process = function() {
    var result, driver = this;

    console.log(Handlebars.compile('Workflow {{workflow.id}}, action: {{action.name}} ({{action.id}}), actor: {{actor.name}} ({{actor.id}}), role: {{role.name}} ({{role.id}})')({
        workflow: this.workflow,
        action: this.action,
        actor: this.actor,
        role: this.role
    }).blue);


    return Promise.resolve().then(function() {
        if (!driver.rules || driver.rules.length === 0) {
            return Promise.reject(Handlebars.compile('There are no rules registered for {{username}} to take action {{name}} ({{id}})!')({
                id: this.action.id,
                name: this.action.name,
                username: this.actor.name
            }));
        }
        
        return driver.rules.getMethods();
    }.bind(this)).then(function(methods) {
        var method;

        if (!methods || methods.length === 0) {
            return Promise.reject(Handlebars.compile('No processing method found for user {{username}} to take action {{name}} ({{id}})!')({
                id: this.action.id,
                name: this.action.name,
                username: this.actor.name
            }));
        }

        return Promise.all(driver.rules.map(function(rule) {
            //TODO: make sure that rule satisfies the ExecAcl



            //get the method to call
            method = methods.get(rule.methodId);

            //make sure that method exists in driver


            if (!driver[method.name]) {
                console.log(Handlebars.compile('Method: {{method.name}} does not exist in {{workflow.name}}!')({
                    workflow: this.workflow,
                    method: method
                }).red);

                // console.log('Should throw error that ' + method.name + ' does not exist!');
                return Promise.reject(Handlebars.compile('Method "{{name}}" does not exist!')({
                    name: method.name
                }));
            }
            //got the method, start executing it
            console.log(Handlebars.compile('Execute Rule {{rule.id}} --> {{workflow.driverClass}}::{{method.name}} with params:')({
                workflow: this.workflow,
                method: method,
                rule: rule
            }).green, this.params);

            return Promise.resolve().then(function() {
                return WorkflowRuleTaskCollection.forge().query(function(qb) {
                    qb.where('ruleId', rule.id);
                    qb.where('isAfter', false);
                }).fetch();
            }).then(function(tasks) {
                if (tasks && tasks.length > 0) {
                    console.log(Handlebars.compile('There are {{tasks.length}} PRE task(s).')({
                        tasks: tasks
                    }).info);

                    return Promise.all(tasks.map(function(task) {
                        console.log(Handlebars.compile('Execute PRE task {{task.id}}.')({
                            task: task
                        }).info);

                        return task.execute(driver);
                    }));
                }
                else {
                    console.log(Handlebars.compile('There are no PRE-tasks.')({}).cyan);
                }
            }.bind(this)).then(function() {
                return driver[method.name]();
            }).then(function(ret) {
                result = ret;
                //entry rule return the item itself
                if (rule.isEntry) {
                    driver.item = ret;

                    return driver.initWorkflowItem(rule).then(function() {
                        return driver.initRoles();
                    });
                }else{
                    if( rule.postStateId ){
                        return this.workflowItem.save({stateId: rule.postStateId}, {patch: true, transacting: driver.transaction});
                    }
                }
            }.bind(this)).then(function() {
                //region execute post tasks
                return WorkflowRuleTaskCollection.forge().query(function(qb) {
                    qb.where('ruleId', rule.id);
                    qb.where('isAfter', true);
                }).fetch();
            }).then(function(tasks) {
                if (tasks && tasks.length > 0) {
                    console.log(Handlebars.compile('There are {{tasks.length}} POST task(s).')({
                        tasks: tasks
                    }).cyan);

                    return Promise.all(tasks.map(function(task) {
                        console.log(Handlebars.compile('Execute POST task {{task.id}}.')({
                            task: task
                        }).cyan);

                        return task.execute(driver);
                    }));
                }
                
                console.log(Handlebars.compile('There are no POST-tasks.')({}).cyan);
                return Promise.resolve();
                
            }.bind(this))
            .then(function(){
                return Promise.resolve(result);
            });
        }.bind(this)));
    }.bind(this));

};

Model.prototype.initRoles = function() {
    throw new Error("child class must implement initRoles()");
};

Model.prototype.assignRole = function(userId, roleId) {
    return this.getUserRole(userId, roleId).then(function(truth) {
        if (!truth) {
            return WorkflowItemUserRole.forge({
                itemId: this.workflowItem.id,
                userId: userId,
                roleId: roleId
            }).save(null, {
                transacting: this.transaction
            }).then(function(doc) {
                console.log(Handlebars.compile('User {{userId}} has been assigned as Role {{roleId}} on {{itemId}} :')({
                    userId: userId,
                    roleId: roleId,
                    itemId: this.workflowItem.id
                }).cyan);
            }.bind(this));
        }
        return Promise.resolve();
    }.bind(this));
};

Model.prototype.revokeRole = function(userId, roleId) {
    return this.getUserRole(userId, roleId).then(function(doc) {
        if (doc) {
            return doc.destroy({
                transacting: this.transaction
            }).then(function(doc) {

                console.log(Handlebars.compile('User {{userId}} has been revoked Role {{roleId}} on {{itemId}} :')({
                    userId: userId,
                    roleId: roleId,
                    itemId: this.workflowItem.id
                }).yellow);
            }.bind(this));
        }
        return Promise.resolve();
    }.bind(this));
};


Model.prototype.getUserRole = function(userId, roleId) {
    return WorkflowItemUserRole.forge({
        itemId: this.workflowItem.id,
        userId: userId,
        roleId: roleId
    }).fetch(null, {
        transacting: this.transaction
    });
};

module.exports = Model;
