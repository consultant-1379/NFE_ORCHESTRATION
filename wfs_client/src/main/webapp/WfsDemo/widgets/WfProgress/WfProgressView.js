define([
    "jscore/core",
    "text!./WfProgress.html",
    "styles!./WfProgress.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },

            getProgressCloseButton: function () {
                return this.getElement().find(".eaWfsDemo-WfProgress-buttonClose");
            },

            getProgressDiagramButton: function () {
                return this.getElement().find(".eaWfsDemo-WfProgress-buttonDiagram");
            },

            getProgressContent: function() {
                return this.getElement().find(".eaWfsDemo-WfProgress-content");
            }

        });

    });