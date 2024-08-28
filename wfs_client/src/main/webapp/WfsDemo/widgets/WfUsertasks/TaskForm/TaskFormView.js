define([
    "jscore/core",
    "template!./TaskForm.html",
    "styles!./TaskForm.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template(this.options);
            },

            getStyle: function() {
                return style;
            },

            getFormContent: function () {
                return this.getElement().find(".eaWfsDemo-TaskForm-Panel-FormContent");
            },
            
            getSubmitButton: function () {
                return this.getElement().find(".eaWfsDemo-TaskForm-buttonSubmit");
            },
            
            getCancelButton: function () {
                return this.getElement().find(".eaWfsDemo-TaskForm-buttonCancel");
            },

            getInfoPanel: function () {
                return this.getElement().find(".eaWfsDemo-TaskForm-InfoPanel-Map");
            }
            
        });

    });