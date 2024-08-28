/*global define*/
define([
    'jscore/core',
    'text!./_systemBar.html',
    'styles!./_systemBar.less'
], function (core, template, styles) {
    

    return core.View.extend({

        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return styles;
        },

        setName: function(name) {
            this.getElement().find(".elwidgets-SystemBar-name").setText(name);
        }

    });

});
