define([
    "jscore/core",
    "./TaskProgressCellView"    
], function(core, View) {

    return core.Widget.extend({

        View: View,

        onViewReady: function () {
            // Add handler to execute button
            var widgetSize = 80;
            // this.view.setProgress(/*this.options.taskCompletePercent*/25, widgetSize);
           this.attachTo(this.view.setProgress(this.options.taskCompletePercent, widgetSize));

            /*executeButton.addEventHandler("click", function (e) {
                var wfUsertaskModel = this.getRow().getData();
                this.getEventBus().publish("executetask", wfUsertaskModel);
            }, this);*/



            // Add handler to diagram button
            //var total = this.view.getTotal();
            /*diagramButton.addEventHandler("click", function (e) {
                this.getEventBus().publish("showdiagram", this.getRow().getData());
            }, this);*/

           
        }

    });

});