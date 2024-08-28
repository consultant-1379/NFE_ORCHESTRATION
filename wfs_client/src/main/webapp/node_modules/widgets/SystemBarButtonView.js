/*global define*/
define([
    'jscore/core',
    'text!./_systemBarButton.html',
    'styles!./_systemBarButton.less'
], function (core, template, styles) {
    

    return core.View.extend({

        getTemplate: function () {
            return template;
        },

        getStyle: function () {
            return styles;
        },

        getLink: function () {
            return this.getElement().find(".elwidgets-SystemBarButton-link");
        }

    });

});
