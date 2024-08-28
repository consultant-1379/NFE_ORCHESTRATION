define([
    'jscore/core',
    "text!./MainRegion.html",
    "styles!./MainRegion.less"
], function (core, template, style) {

    return core.View.extend({

        getTemplate: function() {
            return template;
        },

        getStyle: function() {
            return style;
        },

        getWfDefinitionTab: function() {
            return this.getElement().find(".eaWfsDemo-mainTabs-tabWfDefinition");
        },

        getWfHistoryTab: function() {
            return this.getElement().find(".eaWfsDemo-mainTabs-tabWfHistory");
        },

        getWfActiveTab: function() {
            return this.getElement().find(".eaWfsDemo-mainTabs-tabWfActive");
        },


        getWfDefinitionContent: function() {
            return this.getElement().find(".eaWfsDemo-mainTabs-contentWfDefinition-home");
        },        

        getWfActiveContent: function() {
            return this.getElement().find(".eaWfsDemo-mainTabs-contentWfActive-home");
        },

        getWfHistoryContent: function() {
            return this.getElement().find(".eaWfsDemo-mainTabs-contentWfHistory-home");
        }
    });

});
