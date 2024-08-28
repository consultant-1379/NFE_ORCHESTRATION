define([
    "jscore/core",
    "text!./WfInstances.html",
    "styles!./WfInstances.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },

            getSectionHeadingExtra: function() {
                return this.getElement().find(".eaWfsDemo-WfInstances-SectionHeading-Extra");
            },

            getSectionHeadingFilter: function() {
                return this.getElement().find(".eaWfsDemo-WfInstances-SectionHeading-Filter");
            },


            getTableContent: function() {
                return this.getElement().find(".eaWfsDemo-WfInstances-contentTable");
            },

            getPagination: function() {
                return this.getElement().find(".eaWfsDemo-WfInstances-contentTable");
            },
            
            getTaskFormContent: function() {
                return this.getElement().find(".eaWfsDemo-Usertasks-contentTaskForm");
            },

            getRefreshButton: function(){
                return this.getElement().find(".eaWfsDemo-WfInstances-contentTable-buttonRefresh");
            }
        });

    });