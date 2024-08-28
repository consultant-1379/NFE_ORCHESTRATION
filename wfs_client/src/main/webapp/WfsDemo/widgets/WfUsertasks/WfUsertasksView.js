define([
    "jscore/core",
    "text!./WfUsertasks.html",
    "styles!./WfUsertasks.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },

            getFilter: function() {
                return this.getElement().find(".eaWfsDemo-Usertasks-SectionHeading-Filter");
            },

            getTaskTableContent: function() {
                return this.getElement().find(".eaWfsDemo-Usertasks-contentTaskTable");
            },

            getTaskFormContent: function() {
                return this.getElement().find(".eaWfsDemo-Usertasks-contentTaskForm");
            },

            getTaskTablePagination: function() {
                return this.getElement().find(".eaWfsDemo-Usertasks-contentTaskTablePagination");
            },
            ////////////////// 
            getProgressContent: function() {
                return this.getElement().find(".eaWfsDemo-WfInstances-contentProgress");
            },
            getRefressButton: function(){
                return this.getElement().find(".eaWfsDemo-Usertasks-contentTable-buttonRefresh");
            }
///////////////////////
        });

    });
