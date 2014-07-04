var Super = require('./base');

var Model = Super.extend({
    tableName: 'Product'
});

Object.defineProperty(Model.prototype, 'name', {
    get: function () {
        return this.get('name');
    },
    set: function(val){
        this.set('name', val);
        return this;
    }
});

Object.defineProperty(Model.prototype, 'price', {
    get: function () {
        return this.get('price');
    },
    set: function(val){
        this.set('price', val);
        return this;
    }
});


Object.defineProperty(Model.prototype, 'categoryId', {
    get: function () {
        return this.get('categoryId');
    },
    set: function(val){
        this.set('categoryId', val);
        return this;
    }
});


module.exports = Model;
