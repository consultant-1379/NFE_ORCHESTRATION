// Usertask actions cell

define([
    "widgets/table/Cell",
    "widgets/Tooltip",
    "./TaskActionsCellView"
], function(Cell, Tooltip, View) {

    return Cell.extend({

        View: View,

        onCellReady: function () {
            // Add handler to execute button
            var executeButton = this.view.getExecuteButton();
            executeButton.addEventHandler("click", function (e) {
                var wfUsertaskModel = this.getRow().getData();
                this.getEventBus().publish("executetask", wfUsertaskModel);
            }, this);

            // Tooltip
            var executeButtonTooltip = new Tooltip({
                parent: executeButton,
                enabled: true,
                contentText: 'Execute and complete task',
                modifiers: [{name: 'size', value: 'large'}]
            });
            executeButtonTooltip.attachTo(this.getElement());

            // Add handler to diagram button
            var diagramButton = this.view.getDiagramButton();
            diagramButton.addEventHandler("click", function (e) {
                this.getEventBus().publish("showdiagram", this.getRow().getData());
            }, this);

            // Tooltip
            var diagramButtonTooltip = new Tooltip({
                parent: diagramButton,
                enabled: true,
                contentText: 'Show workflow diagram',
                modifiers: [{name: 'size', value: 'large'}]
            });
            diagramButtonTooltip.attachTo(this.getElement());
        }

    });

});