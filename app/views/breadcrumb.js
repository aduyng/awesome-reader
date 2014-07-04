define(function (require) {
    var Super = require('views/base'),
        Template = require('hbs!./breadcrumb.tpl');

    var View = Super.extend({

    });
    View.prototype.initialize = function(options){
        Super.prototype.initialize.call(this, options);
        if(!this.collection){
            this.collection = new Backbone.Collection();
        }
        this.collection.on('all', this.draw, this);
    };

    View.prototype.render = function () {
        this.draw();
    };

    View.prototype.draw = function () {
        this.$el.html(Template({
            id: this.id,
            hasCrumbs: this.collection.length > 0,
            crumbs: this.collection.map(function(crumb){
                return _.extend(crumb.toJSON(), {activeClass:crumb.get('active')?'active':''});
            })
        }));
    };

    return View;
});