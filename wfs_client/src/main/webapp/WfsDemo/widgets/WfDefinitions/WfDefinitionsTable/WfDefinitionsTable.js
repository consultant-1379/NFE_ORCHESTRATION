// Workflow definitions table widget

define([
    "jscore/core",
    "widgets/Table",
    "wfs/WfDefinitionClient",
    "./WfDefinitionActionsCell/WfDefinitionActionsCell"
    ], function(core, Table, WfDefinitionClient, WfDefinitionActionsCell) {

       return core.Widget.extend({

            onViewReady: function() {
                var showAllVersions = this.options.showAllVersions;

                // construct table immediately because parent may be asking for eventBus
                this.table = new Table({
                    // modifiers: ["striped"],
                    columns: 
                    [
                    {  title: "Workflow",       attribute: "name"                                                         },
///////////////\\\\\\\\\\\\\\\\\\\\                    
                    {  title: "Description",    attribute: "description",                                                 },            
                    {  title: "Version",        attribute: "version",   width: "80px"                                     },
                    {  title: "Actions",                                width: "90px",  cellType: WfDefinitionActionsCell }
                    ]
                });

                // Get workflow definitions
                WfDefinitionClient.getAllDefinitions({
                    latest: !showAllVersions,       // get all or latest
                    sortBy: "name",
                    sortOrder: "asc",
                    success: function(wfDefinitionCollection) {
                        // Connect model to table
                        this.table.setData(wfDefinitionCollection);
                        this.table.attachTo(this.getElement());
                    }.bind(this)
                });
            },

            getEventBus: function () {
                return this.table.getEventBus();
            }
            
        });
});