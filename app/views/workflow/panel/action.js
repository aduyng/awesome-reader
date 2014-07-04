define(function (require) {

    var Super = require('views/base'),
        Promise = require('bluebird'),
        Template = require('hbs!./action.tpl');

    var View = Super.extend({

                            });

    View.prototype.initialize = function(options){
        Super.prototype.initialize.call(this, options);
        
        this.workflow = options.workflow;
    }
    View.prototype.render = function () {
        var rules = this.workflow.rules.where({isVisible: true});
        console.log(rules);
        this.$el.html(Template({
                                   id: this.id,
                                   actions: this.workflow.rules.where({isVisible: true})
                               }));
        this.mapControls();
    };


    return View;
});