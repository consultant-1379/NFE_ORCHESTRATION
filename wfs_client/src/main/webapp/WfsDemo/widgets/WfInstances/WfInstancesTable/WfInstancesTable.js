// Workflow instances table widget

define([
    "jscore/core",
    "jscore/ext/mvp",
    "widgets/Table",
    "wfs/WfDefinitionClient",
    "wfs/WfInstanceClient"
    ], function(core, mvp, Table, WfDefinitionClient, WfInstanceClient) {

       return core.Widget.extend({

            init: function() {
                this.offset = this.options.offset ? this.options.offset : 0;
                this.limit = this.options.limit ? this.options.limit : 20; //default limit 20
                this.sortBy = this.options.sortBy ? this.options.sortBy : "startTime"; //default to startTime
                this.sortOrder = this.options.sortOrder ? this.options.sortOrder : "desc"; //default to desc
                this.showActive = this.options.showActive;
                this.showCompleted = this.options.showCompleted;
             },

            onViewReady: function() {
                // construct table immediately because parent may be asking for eventBus
               this.columns = [ 
                    {  title: "Workflow",       attribute: "workflowName"},
                    {  title: "Version",        attribute: "workflowVersion",           width: "70px" },
                    {  title: "Instance Id",    attribute: "shortWorkflowInstanceId",   width: "90px" },
                ];

                if (this.showActive) {
                    this.columns.push({title: "Start Time", attribute: "startTime", width: "150px" })
                }

                if (this.showCompleted) {
                    this.columns.push({title: "End Time", attribute: "endTime", width: "150px" })
                }

               this.table = new Table({
                    // modifiers: ["striped"],
                    columns: this.columns
                });
                this.renderInstanceTable();
                
            },

            subscribeForPushEvents: function(regionEventBus) {                
                this.regionEventBus = regionEventBus;
                this.regionEventBus.subscribe("instance-event", function(pushEvent) {                
                    this.handlePushEvent(pushEvent);
                }.bind(this));
            },


            handlePushEvent: function(pushEvent) {
                setTimeout(function () {            
                        this.renderInstanceTable();
                    }.bind(this), 2000);
            },

            refresh: function(pageData) {
                this.limit = pageData.limit;
                this.offset = pageData.offset;
                this.renderInstanceTable();
            },

            renderInstanceTable: function() {

                // Get workflow definitions - need these for workflow 'name'
                WfDefinitionClient.getAllDefinitions({
                    success: function(wfDefinitionCollection) {
                        this.workflowDefinitions = {};
                        // Build keyable workflow definitions
                        wfDefinitionCollection.each(function(model) {
                            this.workflowDefinitions[model.getAttribute("id")] = model;
                        }.bind(this));

                        // Get workflow instances
                        WfInstanceClient.getInstances({
                            sortBy: this.sortBy,
                            sortOrder: this.sortOrder,
                            offset: this.offset,
                            limit: this.limit,
                            completed: this.showCompleted,
                            active: this.showActive,
                            success: function(wfInstanceCollection) {
                                // Build model for table
                                var tableInstances = new mvp.Collection();
                                wfInstanceCollection.each(function(model) {
                                    var rowModel = new mvp.Model();
                                    var definitionId = model.getAttribute("definitionId");
                                    rowModel.setAttribute("workflowName", this.workflowDefinitions[definitionId].getAttribute("name"));
                                    rowModel.setAttribute("workflowVersion", this.workflowDefinitions[definitionId].getAttribute("id").match('.*:(.*):.*')[1]);
                                    rowModel.setAttribute("shortWorkflowInstanceId", model.getAttribute("id").substring(0,8));       // short id
                                    rowModel.setAttribute("workflowInstanceId", model.getAttribute("id"));
                                    rowModel.setAttribute("workflowDefinitionId", definitionId);
                                    rowModel.setAttribute("startTime", model.getAttribute("startTime"));
                                    rowModel.setAttribute("endTime", model.getAttribute("endTime"));
                                    rowModel.setAttribute("superProcessInstanceId", model.getAttribute("superProcessInstanceId"));/////////////newly added on may 2014(already existing in the JSON)
                                    tableInstances.addModel(rowModel);
                                }.bind(this));
                                // TODO - reformat date/time                               
                                tableInstances = this.arrangeHierarchically(tableInstances); ///////////////////////////////////// to arrange rows according to hierarchy
                                // Connect model to table
                                this.table.setData(tableInstances);                                
                                this.table.attachTo(this.getElement());                                
                            }.bind(this)
                        });

                        this.highlightedRow = null;
                        // Add row selected/deselected handlers - they publish events
                        this.table.addEventHandler("rowclick", function(row, model) {
                            if (!row.isHighlighted()) {
                                if (this.highlightedRow != null) {
                                    this.highlightedRow.highlight(false); 
                                    this.getEventBus().publish("instance-deselected", this.highlightedRow.getData().attributes); /////
                                    this.highlightedRow = null;
                                }
                                row.highlight(true);
                                this.highlightedRow = row; 
                                this.getEventBus().publish("instance-selected",
                                    { workflowDefinitionId: model.getAttribute("workflowDefinitionId"),
                                      workflowInstanceId: model.getAttribute("workflowInstanceId"),
                                      workflowName: model.getAttribute("workflowName")});
                            }
                            else {
                                row.highlight(false);
                                this.highlightedRow = null;
                                this.getEventBus().publish("instance-deselected", row.getData().attributes);
                            }
                        }.bind(this));
                    }.bind(this)
                });
            },

            getEventBus: function () {
                return this.table.getEventBus();
            },

////////////////////////////////// function to arrange the children processes indented wrt parent
//// takes each workflow and search for its children based on "superProcessInstanceId"
//// puts the parent on top of a new collection and each child indented with ". . ."
//// if no child available, simply add the work flow in new collection
            arrangeHierarchically: function (rowsCollection) {               
                var rowsCollection1 = rowsCollection;
                var rowsCollection2 = new mvp.Collection();
                rowsCollection1.each(function(row) {
                    var children = rowsCollection1.searchMap(row.get("workflowInstanceId"), ["superProcessInstanceId"]);
                    if(children.size()){
                        rowsCollection2.addModel(row);
                        children.each(function (child) {
                            child.setAttribute("workflowName", ". . . ".concat(child.getAttribute("workflowName")));
                        });
                        rowsCollection2.addModel(children._collection.models);
                    }
                    else if(rowsCollection1.searchMap(row.get("superProcessInstanceId"), ["workflowInstanceId"]).size() == 0)
                        rowsCollection2.addModel(row);  
                });
                return rowsCollection2;              
            }
        });
});