define([
    "jscore/core",
    "text!./WfProgressDiagram.html",
    "styles!./WfProgressDiagram.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },

            getBackButton: function () {
                return this.getElement().find(".eaWfsDemo-WfProgressDiagram-buttonBack");
            },

            getCalledContent: function() {
                return this.getElement().find(".eaWfsDemo-WfProgressDiagram-contentCalled");
            },

            getDiagramContent: function() {
                return this.getElement().find(".eaWfsDemo-WfProgressDiagram-contentDiagram");
            },
            getProgressCloseButton: function() {
                return this.getElement().find(".eaWfsDemo-WfProgressDiagram-buttonClose");
            }

        });

    });