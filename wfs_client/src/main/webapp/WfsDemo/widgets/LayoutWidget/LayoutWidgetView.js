define([
    "jscore/core",
    "text!./LayoutWidget.html",
    "styles!./LayoutWidget.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },
        });

    });