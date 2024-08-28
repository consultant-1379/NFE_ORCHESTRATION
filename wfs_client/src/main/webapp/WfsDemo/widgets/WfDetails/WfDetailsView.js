define([
    "jscore/core",
    "text!./WfDetails.html",
    "styles!./WfDetails.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },

            getDefinitionDiagramTab: function() {
                return this.getElement().find(".eaWfsDemo-WfDetails-TabDefinitionDiagram");
            },

            getUsertaskDiagramTab: function() {
                return this.getElement().find(".eaWfsDemo-WfDetails-TabUsertaskDiagram");
            },

            getProgressDiagramTab: function() {
                return this.getElement().find(".eaWfsDemo-WfDetails-TabProgressDiagram");
            },

            getDefinitionDiagramContent: function() {
                return this.getElement().find(".eaWfsDemo-WfDetails-contentDefinitionDiagram");
            },

            getUsertaskDiagramContent: function() {
                return this.getElement().find(".eaWfsDemo-WfDetails-contentUsertaskDiagram");
            },

            getProgressDiagramContent: function() {
                return this.getElement().find(".eaWfsDemo-WfDetails-contentProgressDiagram");
            }

        });

    });