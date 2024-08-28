define([
    "jscore/core",
    "text!./WfDefinitions.html",
    "styles!./WfDefinitions.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },

            getFilterLink: function() {
                return this.getElement().find(".eaWfsDemo-WfDefinitions-SectionHeading-Filter-link");
            },

            getTableContent: function() {
                return this.getElement().find(".eaWfsDemo-WfDefinitions-contentTable");
            },

            getFormContent: function() {
                return this.getElement().find(".eaWfsDemo-WfDefinitions-contentForm");
            },

            getRefressButton: function(){
                return this.getElement().find(".eaWfsDemo-WfDefinitions-contentTable-buttonRefresh");
            }
        });

    });