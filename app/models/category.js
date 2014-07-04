define(function(require) {
    var Super = require('./base'),
        ProductCollection = require('../collections/product');


    var Model = Super.extend({
        urlRoot: '/rest/category'
    });


    Object.defineProperty(Model.prototype, 'name', {
        get: function() {
            return this.get('name');
        },
        set: function(val) {
            this.set('name', val);
            return this;
        }
    });

    Object.defineProperty(Model.prototype, 'products', {
        get: function() {
            var v = this.get('products');
            if (!(v instanceof ProductCollection)) {
                v = new ProductCollection(v);
                this.set('products', v);
            }
            return v;
        }
    });
    return Model;
});