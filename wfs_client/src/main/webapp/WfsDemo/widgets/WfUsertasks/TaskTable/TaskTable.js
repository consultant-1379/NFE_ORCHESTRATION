// Usertask table widget

define([
    "jscore/core",
    "jscore/ext/mvp",
    "widgets/Table",
    "wfs/WfDefinitionClient",    
    "wfs/WfUsertaskClient",
    "./TaskActionsCell/TaskActionsCell",
    "./TaskProgressCell/TaskProgressCell"
    ], function(core, mvp, Table, WfDefinitionClient, WfUsertaskClient, TaskActionsCell,TaskProgressCell) {

        return core.Widget.extend({

            init: function() {
                this.offset = this.options.offset ? this.options.offset : 0;
                this.limit = this.options.limit ? this.options.limit : 20; //default limit 20

            },

            onViewReady: function() {
                // construct table immediately because parent will be asking for eventBus

                this.table = new Table({
                    // modifiers: ["striped"],
                    columns: 
                    [
                    {   title: "Created",       attribute: "created"                                                                },
                    {   title: "Task",          attribute: "name"                                                                   },
                    {   title: "Workflow",      attribute: "workflowName"                                                           },
                    {   title: "Version",       attribute: "workflowVersion",           width: "80px"                               },
                    {   title: "Instance Id",   attribute: "shortWorkflowInstanceId",   width: "90px"                               },
                    {   title: "Actions",                                               width: "80px",  cellType: TaskActionsCell   }/*,
/////////////////////////////////                    
                    {   title: "Progress",      attribute: "taskCompletePercent",       width: "90px"/*, cellType: TaskProgressCell}*/
/////////////////////////////////                    
                    ]
                });

                this.renderUserTaskTable();
            },
            
            subscribeForPushEvents: function(regionEventBus) {                
                this.regionEventBus = regionEventBus;

                this.regionEventBus.subscribe("usertask-event", function(pushEvent) {
                    this.renderUserTaskTable();
                }.bind(this));
            },

            getEventBus: function () {
                return this.table.getEventBus();
            },

            refresh: function(pageData) {
                this.limit = pageData.limit;
                this.offset = pageData.offset;
                this.renderUserTaskTable();
            },

            // Note - Performing serialised requests to server. Alternatively concurrent requests
            // could be performed, but that would leave complication of waiting until both responses
            // have been received before rendering the table, possible race conditions, etc.

            // Get workflow definitions - need these for workflow 'name ' because tasks do not have the workflow 'name'               
            renderUserTaskTable: function() {    
                
                WfDefinitionClient.getAllDefinitions({
                    success: function(wfDefinitionCollection) {
                        wfUsertaskCollection2 = new mvp.Collection();

                        this.workflowDefinitions = {};
                        this.TaskProgress = {};
                        // Build keyable workflow definitions
                        wfDefinitionCollection.each(function(wfDefinitionModel) {
                            this.workflowDefinitions[wfDefinitionModel.getAttribute("id")] = wfDefinitionModel;
                        }.bind(this));

                        // Get all active usertasks - TODO: filters
                        WfUsertaskClient.getUsertasks({
                            sortBy: "created",
                            sortOrder: "desc",
                            offset: this.offset,
                            limit: this.limit,
                            success: function(wfUsertaskCollection) {                                
                                // Build model for table
                                
                                wfUsertaskCollection.each(function(wfUsertaskModel) {
                                 
                                    wfUsertaskModel2 = new mvp.Model();

                                    wfUsertaskModel2.setAttribute("id", wfUsertaskModel.getAttribute("id"));
                                    wfUsertaskModel2.setAttribute("definitionId", wfUsertaskModel.getAttribute("definitionId"));
                                    wfUsertaskModel2.setAttribute("name", wfUsertaskModel.getAttribute("name"));
                                    wfUsertaskModel2.setAttribute("created", wfUsertaskModel.getAttribute("created"));
                                    wfUsertaskModel2.setAttribute("workflowDefinitionId", wfUsertaskModel.getAttribute("workflowDefinitionId"));
                                    wfUsertaskModel2.setAttribute("workflowName", this.workflowDefinitions[wfUsertaskModel.getAttribute("workflowDefinitionId")].getAttribute("name"));
                                    wfUsertaskModel2.setAttribute("workflowVersion", this.workflowDefinitions[wfUsertaskModel.getAttribute("workflowDefinitionId")].getAttribute("id").match('.*:(.*):.*')[1]);
                                    wfUsertaskModel2.setAttribute("shortWorkflowInstanceId", wfUsertaskModel.getAttribute("workflowInstanceId").substring(0,8)); // short id
                                    wfUsertaskModel2.setAttribute("workflowInstanceId", wfUsertaskModel.getAttribute("workflowInstanceId"));

                                    //Check if User task was already addded via push
                                    var model = wfUsertaskCollection2.search(wfUsertaskModel.getAttribute("id"), ['id']);

                                    if ( model.length == 0 ) {
                                        wfUsertaskCollection2.addModel(wfUsertaskModel2);
                                    }
                                    
                                    
                                }.bind(this));

                                // TODO - reformat date/time

                                // Connect model to table
                                this.table.sort("created", "desc");
                                this.table.setData(wfUsertaskCollection2/*._collection.models[1]*/);
                                this.table.attachTo(this.getElement());                                
                                
                            }.bind(this)
                        });
///////////////// added to publish row selected and deselected event (to be used in WfUsertask.js)//////////////////////////
                        this.table.addEventHandler("rowclick", function(row, model) {
                            if (!row.isHighlighted()) {
                                if (this.highlightedRow != null) {
                                    this.highlightedRow.highlight(false);
                                    this.getEventBus().publish("task-deselected", this.highlightedRow.getData().attributes);
                                    this.highlightedRow = null;
                                }
                                row.highlight(true);
                                this.highlightedRow = row; 
                                this.getEventBus().publish("task-selected",
                                    { workflowDefinitionId: model.getAttribute("workflowDefinitionId"),
                                      workflowInstanceId: model.getAttribute("workflowInstanceId"),
                                      workflowName: model.getAttribute("workflowName"),
                                      wfUsertaskModel: model });
                            }
                            else {
                                row.highlight(false);
                                this.highlightedRow = null;
                                this.getEventBus().publish("task-deselected", row.getData().attributes);
                            }
                        }.bind(this));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    }.bind(this)
                });
        }

        });

});
