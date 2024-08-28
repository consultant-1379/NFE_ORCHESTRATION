// Error dialog - modal

define([
    "jscore/core",
    "widgets/Dialog"
    ], function(core, Dialog) {

       return core.Widget.extend({

            onViewReady: function() {
                var title = this.options.title;
                var message = this.options.message;

                var dialog = new Dialog({
                    header: title,
                    type: 'error',
                    content: message,
                    showPrimaryButton: false,
                    secondaryButtonCaption: 'Close',
                    visible: true
                });
                dialog.show();
                dialog.getSecondaryButton().addEventHandler('click', function () {
                    dialog.hide();
                }.bind(this));

                // Log
                console.log(title + ": " + message);        // TODO - use UI SDK recommended logging
            }

        });
});