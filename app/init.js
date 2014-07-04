/*global requirejs*/

requirejs.config({
//    urlArgs: 'v=' + [config.app.version.major, config.app.version.minor, config.app.version.patch].join('.'),
                     baseUrl    : './',
                     locale     : "vi-vn",
                     waitSeconds: 30,
                     paths      : {
                         underscore            : '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
                         backbone              : '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
                         bootstrap             : '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min',
                         'bootstrap-switch'    : '//cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.0.0/js/bootstrap-switch.min',
                         text                  : 'vendors/requirejs-text/text',
                         goog                  : 'vendors/requirejs-plugins/src/goog',
                         async                 : 'vendors/requirejs-plugins/src/async',
                         propertyParser        : 'vendors/requirejs-plugins/src/propertyParser',
                         image                 : 'vendors/requirejs-plugins/src/image',
                         json                  : 'vendors/requirejs-plugins/src/json',
                         hbs                   : 'vendors/require-handlebars-plugin/hbs',
                         i18nprecompile        : 'vendors/require-handlebars-plugin/hbs/i18nprecompile',
                         json2                 : 'vendors/require-handlebars-plugin/hbs/json2',
                         jquery                : 'vendors/jquery/dist/jquery',
                         bootstrapConfirmButton: 'vendors/bootstrap-confirm-button/bootstrap-confirm-button',
                         'bootstrap-touchspin' : 'vendors/bootstrap-touchspin/bootstrap-touchspin/bootstrap.touchspin',
                         bootstrapValidator    : 'vendors/bootstrapValidator/dist/js/bootstrapValidator.min',
                         toastr                : '//cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.0/js/toastr.min',
                         ladda                 : '//cdnjs.cloudflare.com/ajax/libs/ladda-bootstrap/0.1.0/ladda.min',
                         spin                  : '//cdnjs.cloudflare.com/ajax/libs/spin.js/2.0.0/spin.min',
                         moment                : "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.6.0/moment.min",
                         nprogress             : "//cdnjs.cloudflare.com/ajax/libs/nprogress/0.1.2/nprogress.min",
                         'underscore.string'   : '//cdnjs.cloudflare.com/ajax/libs/underscore.string/2.3.3/underscore.string.min',
                         accounting            : '//cdnjs.cloudflare.com/ajax/libs/accounting.js/0.3.2/accounting.min',
                         bluebird              : '//cdnjs.cloudflare.com/ajax/libs/bluebird/1.2.2/bluebird',
                     },
                     hbs        : {
                         helpers          : true,
                         i18n             : true,
                         templateExtension: 'hbs',
                         partialsUrl      : '',
                         disableI18n      : false
                     },
                     shim       : {
                         backbone               : {
                             deps   : ['underscore', 'jquery'],
                             exports: 'Backbone'
                         },
                         toastr                 : {
                             deps: ['jquery']
                         },
                         nprogress              : {
                             deps: ['jquery']
                         },
                         bootstrapConfirmButton : {
                             deps: ["jquery", "bootstrap"]
                         },
                         'bootstrap-touchspin'  : {
                             deps: ["jquery", "bootstrap"]
                         },
                         bootstrap              : {
                             deps: ["jquery"]
                         },
                         ladda                  : {
                             deps: ["spin"]
                         },
                         'jquery.cookie'        : {
                             deps: ['jquery']
                         },
                         'bootstrapValidator': {
                             deps: ['jquery', 'bootstrap']
                         },
                         'bootstrap-switch'     : {
                             deps: ['jquery']

                         },
                         router                 : {
                             depts: [
                                 'nprogress'
                             ]
                         },
                         app                    : {
                             deps: [
                                 'jquery',
                                 'underscore',
                                 'backbone',
                                 'bootstrap',
                                 'toastr',
                                 'accounting',
                                 'moment',
                                 'nprogress'
                             ]
                         }
                     }
                 });
if (!Function.prototype.bind) {
    Function.prototype.bind = function (bind) {
        var self = this;
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return self.apply(bind || null, args);
        };
    };
}

require([
            'jquery',
            'bootstrapValidator',
            'bootstrapConfirmButton',
            'bootstrap-touchspin',
            'spin',
            'ladda',
            'moment',
            'underscore',
            'underscore.string',
            'backbone',
            'bootstrap',
            'toastr',
            'accounting',
            'moment',
            'nprogress',
            'bootstrap-switch',
            'hbs/handlebars'],
        function ($, bootstrapValidator, bootstrapConfirmButton, bootstrapTouchspin, Spin, Ladda, moment, _, _s, Backbone, Bootstrap, Toastr, Accounting, Moment, NProgress, BootstrapSwitch, Handlebars) {
            //region add current time and version to the request
            Backbone.ajax = function(){
                var args = arguments;
                if( !args[0]) {
                    args[0] = {};
                }
                if( !args[0].headers ){
                    args[0].headers = {};
                }
                _.extend(args[0].headers, {'X-Version': window.config.version, 'X-Now': moment().unix()});
                var oldError = args[0].error;
                args[0].error = function(jqXHR, textStatus, errorThrown){
                    if( oldError ){
                        oldError(jqXHR, textStatus, errorThrown)
                    }

                    //reload because there is a new version
                    if(jqXHR.status == 426){
                        window.location.reload();
                    }
                    
                };
                return Backbone.$.ajax.apply(Backbone.$, args);  
            };

            if (!window._s) {
                window._s = _s;
            }
            if (!window.Ladda) {
                window.Ladda = Ladda;
            }


            require(['app'], function (Application) {

                window.app = new Application({
                                             });
                window.app.run();
            });
        });