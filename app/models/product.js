define(function (require) {
    var Super = require('./base');

    var Model = Super.extend({
        defaults: {
            isActive: true
        },
        urlRoot: '/rest/product'
    });


    Object.defineProperty(Model.prototype, 'categoryId', {
        get: function () {
            return this.get('categoryId');
        },
        set: function (val) {
            this.set('categoryId', val);
            return this;
        }
    });


    Object.defineProperty(Model.prototype, 'category', {
        get: function () {
            return this.ds.categories.get(this.categoryId);
        }
    });


    Object.defineProperty(Model.prototype, 'name', {
        get: function () {
            return this.get('name');
        },
        set: function (val) {
            this.set('name', val);
            return this;
        }
    });

    Object.defineProperty(Model.prototype, 'price', {
        get: function () {
            return this.get('price');
        },
        set: function (val) {
            this.set('price', val);
            return this;
        }
    });

    Object.defineProperty(Model.prototype, 'isActive', {
        get: function () {
            return this.get('isActive');
        },
        set: function (val) {
            this.set('isActive', val);
            return this;
        }
    });


    return Model;
});