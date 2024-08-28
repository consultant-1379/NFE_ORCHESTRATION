define([
    "jscore/core",
    "text!./WfForm.html",
    "styles!./WfForm.less"    
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },

			getFormContent: function() {
                return this.getElement().find(".eaWfsDemo-WfForm-content");
            }
        });

    });