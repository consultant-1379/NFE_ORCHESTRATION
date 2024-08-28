define([
    "jscore/core",
    "text!./Selector.html"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            }

        });

    });