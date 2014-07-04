/*global _, Backbone, _s*/
define(function(require) {
    var Super = Backbone.View;

    function getGUID() {
        if (!window.guid) {
            window.guid = 0;
        }
        window.guid++;
        return 'uid' + '-' + window.guid;
    }

    var View = Super.extend({});

    View.prototype.initialize = function(options) {
        options = options || {};
        options.id = options.id || getGUID();

        Super.prototype.initialize.call(this, options);
        if (!this.id) {
            this.id = options.id;
        }
        if (!this.options) {
            this.options = options;
        }
        this.controls = {};
        this.children = {};
    };

    View.prototype.mapControls = function() {
        _.forEach(this.$el.find('[id]'), function(element) {
            var e = $(element);
            if (!e.attr('name')) {
                e.attr('name', e.attr('id'));
            }
            this.controls[_s.camelize(e.attr('id').replace(this.id + '-', ''))] = e;
        }, this);
    };

    View.prototype.parseMessages = function() {
        this.i18n = {};
        _.forEach(this.$el.find('.' + this.getId('i18n')), function(element) {
            var e = $(element);
            this.i18n[_s.camelize(e.data('key'))] = e.html();
        }, this);
    };

    View.prototype.serialize = function() {
        var serializedData = {};
        _.forEach(this.$el.find('.' + this.getId('field')), function(element) {
            var e = $(element);
            var val;
            if (e.is('.radio-group')) {
                val = e.find('input[name=' + e.attr('id') + ']:checked').val();
            }
            else if (e.is('input[type=checkbox]')) {
                val = e.is(':checked');
            }
            else {
                val = e.val();
            }
            serializedData[_s.camelize(e.attr('id').replace(this.id + '-', ''))] = val;
        }, this);
        return serializedData;
    };

    View.prototype.getId = function(suffix) {
        var id = this.id || this.options.id;
        if (!_.isEmpty(suffix)) {
            id += '-' + suffix;
        }
        return id;
    };
    View.prototype.isValid = function(){
        if( this.validatorContainer ){
            this.validatorContainer.data('bootstrapValidator').validate();
            return this.validatorContainer.data('bootstrapValidator').isValid();
        }
        return true;
    }
    View.prototype.initValidators = function(options, container) {
        this.validatorContainer = (container || this.$el);
        
        this.validatorContainer.bootstrapValidator(_.extend({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            }
        }, options));
    };

    View.prototype.find = function(selector) {
        return this.$el.find(selector);
    };

    View.prototype.toId = function(name) {
        return '#' + this.getId(name);
    };

    View.prototype.toClass = function(name) {
        return '.' + this.getId(name);
    };

    View.prototype.findByClass = function(cls) {
        return this.find(this.toClass(cls));
    };

    View.prototype.findById = function(id) {
        return this.find(this.toId(id));
    };


    return View;
});